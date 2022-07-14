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

    return res.status(200).json({
      data: {
        items: users || [],
        total: users.length,
        pages: Math.floor(users.length / size) + 1,
        currentPage: parseInt(page),
      },
    });
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

    return res.status(200).json({
      status: 'success',
      data: {
        items: posts || [],
        total: posts.length,
        pages: Math.floor(posts.length / size) + 1,
        currentPage: parseInt(page),
      },
    });
  } catch (err) {
    return res.status(503).json({ message: 'Service error. Please try again later' });
  }
};
