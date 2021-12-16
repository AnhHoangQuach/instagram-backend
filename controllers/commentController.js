const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');

module.exports.createComment = async (req, res, next) => {
  const { postId } = req.params;
  const { content } = req.body;
  const user = req.user;

  if (!user) {
    return res.status(404).json({ status: 'error', message: 'You need to be logged in' });
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
