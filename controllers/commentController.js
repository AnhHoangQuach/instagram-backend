const Post = require('../models/Post');
const Comment = require('../models/Comment');
const ObjectId = require('mongoose').Types.ObjectId;

module.exports.createComment = async (req, res, next) => {
  const { postId } = req.params;
  const { content } = req.body;
  const user = req.user;

  if (!user) {
    return res.status(404).json({ status: 'error', message: 'Unauthorized' });
  }

  if (!postId) {
    return res.status(400).json({
      status: 'error',
      message: ' Please provide the id of the post you would like to comment on',
    });
  }

  if (content.length < 1) {
    return res
      .status(401)
      .json({ status: 'error', message: 'Comment should be at least 1 character' });
  }

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(404)
        .send({ status: 'error', message: 'Could not find a post with that post id.' });
    }
    const comment = new Comment({ user: user._id, post: postId, content: content });
    await comment.save();

    return res.status(200).json({ status: 'success', message: 'Comment successfully' });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

module.exports.deleteComment = async (req, res, next) => {
  const { commentId } = req.params;
  const user = req.user;

  if (!user) {
    return res.status(404).json({ status: 'error', message: 'Unauthorized' });
  }

  if (!commentId) {
    return res.status(400).json({
      status: 'error',
      message: ' Please provide the id of the comment you would like to delete',
    });
  }

  try {
    const comment = await Comment.findOne({ _id: commentId, user: user._id });
    if (!comment) {
      return res
        .status(404)
        .send({ status: 'error', message: 'Could not find a comment with that comment id.' });
    }

    if (comment.user.toString() !== user._id.toString()) {
      return res.status(401).json({
        status: 'error',
        message: 'You are not authorized to delete this comment',
      });
    }

    await comment.remove();
    return res.status(200).json({ status: 'success', message: 'Delete comment successfully' });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

module.exports.retrieveComments = async (postId, offset, exclude = 0) => {
  try {
    const commentsAggregation = await Comment.aggregate([
      {
        $facet: {
          comments: [
            { $match: { post: ObjectId(postId) } },
            // Sort the newest comments to the top
            { $sort: { date: -1 } },
            // Skip the comments we do not want
            // This is desireable in the even that a comment has been created
            // and stored locally, we'd not want duplicate comments
            { $skip: Number(exclude) },
            // Re-sort the comments to an ascending order
            { $sort: { date: 1 } },
            { $skip: Number(offset) },
            { $limit: 10 },

            {
              $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'user',
              },
            },
            { $unwind: '$user' },
            {
              $unset: [
                'user.password',
                'user.email',
                'user.bio',
                'user.website',
                'user.savedPosts',
              ],
            },
          ],
          commentCount: [
            {
              $match: { post: ObjectId(postId) },
            },
            { $group: { _id: null, count: { $sum: 1 } } },
          ],
        },
      },
      {
        $unwind: '$commentCount',
      },
      {
        $addFields: {
          commentCount: '$commentCount.count',
        },
      },
    ]);
    return commentsAggregation[0];
  } catch (err) {
    throw new Error(err);
  }
};
