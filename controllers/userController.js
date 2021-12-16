const Post = require('../models/Post');
const User = require('../models/User');
const Follower = require('../models/Follower');
const cloudinary = require('cloudinary').v2;
const bcrypt = require('bcrypt');
const fs = require('fs');
const {
  validateEmail,
  validateFullName,
  validateUsername,
  validatePassword,
  validateWebsite,
  validateBio,
} = require('../utils/validation');

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

    const profileFollowStats = await Follower.findOne({ user: userId });

    res.status(200).json({
      status: 'success',
      data: {
        user,
        followersLength:
          profileFollowStats.followers.length > 0 ? profileFollowStats.followers.length : 0,

        followingLength:
          profileFollowStats.following.length > 0 ? profileFollowStats.following.length : 0,
      },
    });
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
    return res.status(500).json({ status: 'error', message: err.message });
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
    return res.status(500).json({ status: 'error', message: err.message });
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
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

module.exports.getFollowing = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const users = await Follower.findOne({ user: userId }).populate(
      'following.user',
      '-password -savedPosts'
    );

    return res.status(200).json({ status: 'success', data: users.following });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

module.exports.getFollowers = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const users = await Follower.findOne({ user: userId }).populate(
      'followers.user',
      '-password -savedPosts'
    );

    return res.status(200).json({ status: 'success', data: users.followers });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

module.exports.updateProfile = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'You not logged in' });
    }
    const { username, fullname, website, bio, email } = req.body;
    const userDocument = await User.findOne({ _id: user._id });
    if (username) {
      const usernameError = validateUsername(username);
      if (usernameError) return res.status(400).json({ status: 'error', message: usernameError });
      if (username === user.username) {
        return res
          .status(400)
          .json({ status: 'error', message: 'Please choose another username.' });
      }
      userDocument.username = username;
    }
    if (fullname) {
      const fullNameError = validateFullName(fullname);
      if (fullNameError) return res.status(400).json({ status: 'error', message: fullNameError });
      userDocument.fullname = fullname;
    }
    if (website) {
      const websiteError = validateWebsite(website);
      if (websiteError) return res.status(400).json({ status: 'error', message: websiteError });
      if (!website.includes('http://') && !website.includes('https://')) {
        userDocument.website = 'https://' + website;
      } else {
        userDocument.website = website;
      }
    }
    if (bio) {
      const bioError = validateBio(bio);
      if (bioError) return res.status(400).json({ status: 'error', message: bioError });
      userDocument.bio = bio;
    }
    if (email) {
      const emailError = validateEmail(email);
      if (emailError) return res.status(400).send({ error: emailError });
      // Make sure the email to update to is not the current one
      if (email !== user.email) {
        const existingUser = await User.findOne({ email });
        if (existingUser)
          return res.status(400).json({ status: 'error', message: 'Please choose another email.' });
        userDocument.email = email;
      }
    }
    await userDocument.save();
    return res.status(200).json({ status: 'success', message: 'Update Profile Success' });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

module.exports.changeAvatar = async (req, res, next) => {
  const user = req.user;
  if (!user) {
    return res.status(404).json({ status: 'error', message: 'You not logged in' });
  }

  if (!req.file) {
    return res
      .status(400)
      .json({ status: 'errror', message: 'Please provide the image to upload.' });
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  try {
    const response = await cloudinary.uploader.upload(req.file.path, {
      width: 200,
      height: 200,
    });
    fs.unlinkSync(req.file.path);

    await User.updateOne({ _id: user._id }, { avatar: response.secure_url });
    return res.status(200).json({ status: 'success', message: 'Update Avatar Success' });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

module.exports.changePassword = async (req, res, next) => {
  const user = req.user;
  if (!user) {
    return res.status(404).json({ status: 'error', message: 'You not logged in' });
  }

  const { oldPassword, newPassword } = req.body;
  try {
    const userDocument = await User.findById(user._id);

    const result = await bcrypt.compare(oldPassword, userDocument.password);
    if (!result) {
      return res.status('401').json({ status: 'error', message: 'Wrong password' });
    }

    const newPasswordError = validatePassword(newPassword);
    if (newPasswordError)
      return res.status(400).json({ status: 'error', message: newPasswordError });

    userDocument.password = newPassword;
    await userDocument.save();
    return res.status(200).json({ status: 'success', message: 'Change Password Success' });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
};
