const Post = require('../models/Post');
const User = require('../models/User');
const Follower = require('../models/Follower');
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
  if (!user || !userId) {
    return res.status(404).json({ status: 'error', message: 'User not found' });
  }

  try {
    const mySelf = await Follower.findOne({ user: user.id });
    const userToFollow = await Follower.findOne({ user: userId });

    const isFollowing =
      mySelf.following.length > 0 &&
      mySelf.following.filter((following) => following.user.toString() === userId).length > 0;

    if (isFollowing) {
      return res.status(401).json({ status: 'error', message: 'User Already Followed' });
    }

    await mySelf.following.unshift({ user: userId });
    await mySelf.save();

    await userToFollow.followers.unshift({ user: user.id });
    await userToFollow.save();

    return res.status(200).json({ status: 'success', message: 'Follow Success' });
  } catch (err) {
    return res.status(500).json({ message: 'Something error', status: err.message });
  }
};

module.exports.unfollowUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = req.user;

    const mySelf = await Follower.findOne({
      user: user.id,
    });

    const userToUnfollow = await Follower.findOne({
      user: userId,
    });

    if (!user || !userToUnfollow) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    const isFollowing =
      mySelf.following.length > 0 &&
      mySelf.following.filter((following) => following.user.toString() === userId).length === 0;

    if (isFollowing) {
      return res.status(401).json({ status: 'error', message: 'User Already Followed' });
    }

    const removeFollowing = await mySelf.following
      .map((following) => following.user.toString())
      .indexOf(userId);

    await mySelf.following.splice(removeFollowing, 1);
    await mySelf.save();

    const removeFollower = await userToUnfollow.followers
      .map((follower) => follower.user.toString())
      .indexOf(userId);

    await userToUnfollow.followers.splice(removeFollower, 1);
    await userToUnfollow.save();

    return res.status(200).send({ status: 'success', message: 'Unfollow Success' });
  } catch (error) {
    return res.status(500).json({ message: 'Something error', status: err.message });
  }
};
