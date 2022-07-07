const User = require('../models/User');
const Post = require('../models/Post');

module.exports.fetchUsers = async (req, res) => {
  var query = {};
  try {
    const { page, size, orderBy, email } = req.query;
    if (!page) page = 1;
    if (!size) size = 10;

    const orderByValue = orderBy === 'desc' ? -1 : 1;

    if (email) query.email = email;

    const users = await User.find(query)
      .select('-password -role')
      .sort({ createdAt: orderByValue })
      .skip(size * page - size)
      .limit(size);

    return res.status(200).json({ status: 'success', data: users || [] });
  } catch (err) {
    return res.status(503).json({ message: 'Service error. Please try again later' });
  }
};

module.exports.fetchPosts = async (req, res) => {
  var query = {};
  try {
    const { page, size, orderBy, email, username } = req.query;
    if (!page) page = 1;
    if (!size) size = 10;

    const orderByValue = orderBy === 'desc' ? -1 : 1;

    if (email) query.email = email;
    if (username) query.username = username;

    const posts = await Post.find(query)
      .populate('user', '-password -role -savedPosts')
      .populate('likes.user', '-password -role -savedPosts')
      .sort({ createdAt: orderByValue })
      .skip(size * page - size)
      .limit(size);

    return res.status(200).json({ status: 'success', data: posts || [] });
  } catch (err) {
    return res.status(503).json({ message: 'Service error. Please try again later' });
  }
};

module.exports.changeStatusUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json('User not found');
    }

    user.status = !user.status;
    await user.save();
    return res.status(200).json({ status: 'success', message: 'Change status user successfully' });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
};
