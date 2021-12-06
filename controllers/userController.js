const Post = require('../models/Post');
const User = require('../models/User');
const ObjectId = require('mongoose').Types.ObjectId;

module.exports.getUser = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const user = await User.findOne({ _id: userId })
      .select('-password')
      .populate({ path: 'savedPosts' })
      .lean()
      .exec();

    if (!user) {
      return res
        .status(404)
        .send({ status: 'error', message: 'Could not find a user with that id.' });
    }

    res.status(200).json({ status: 'success', data: { user } });
  } catch (err) {
    return res.status(404).send({ status: 'error', message: err.message });
  }
};

module.exports.bookmarkPost = async (req, res, next) => {
  const { postId } = req.params;
  const user = req.user;
  if (!user) {
    return res.status(404).json({ status: 'error', message: 'You need to be logged in' });
  }

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(404)
        .json({ status: 'error', message: 'Could not find a post with that id.' });
    }

    if (user.savedPosts.includes(postId)) {
      await User.findByIdAndUpdate(user.id, {
        $pull: { savedPosts: postId },
      });

      return res
        .status(200)
        .json({ status: 'success', message: 'Remove bookmarked post successfully' });
    } else {
      await User.findByIdAndUpdate(user.id, {
        $push: { savedPosts: postId },
      });

      return res.status(200).json({ status: 'success', message: 'Bookmarked post successfully' });
    }
  } catch (err) {
    return res.status(500).send({ error: err.message });
  }
};

module.exports.followUser = async (req, res, next) => {
  const { userId } = req.params;
  const user = req.user;
  if (!user) {
    return res.status(404).json({ status: 'error', message: 'You need to be logged in' });
  }

  try {
    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
      return res
        .status(400)
        .json({ status: 'error', message: 'Could not find a user with that id.' });
    }
    if (userId === user.id) {
      return res
        .status(404)
        .json({ message: "You can't unfollow/follow yourself", status: 'error' });
    }
  } catch (err) {
    return res.status(500).json({ message: 'Something error', status: err.message });
  }
};
