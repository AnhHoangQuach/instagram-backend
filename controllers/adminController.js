const User = require('../models/User');
const Post = require('../models/Post');
const Chat = require('../models/Chat');

module.exports.fetchUsers = async (req, res) => {
  var query = {
    role: 'user',
  };

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

module.exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ status: 'error', message: 'Email and password are required' });

  try {
    const user = await User.findOne({ email });
    if (!user || user.role !== 'admin')
      return res.status(400).json({ status: 'error', message: 'Email or password is incorrect' });

    const isMatch = await user.checkPassword(password);
    if (!isMatch)
      return res.status(400).json({ status: 'error', message: 'Email or password is incorrect' });

    const token = user.getToken();

    const chat = await Chat.findOne({ user: user._id });
    if (!chat) {
      await new Chat({ user: user._id, chats: [] }).save();
    }

    return res.status(200).json({ status: 'success', data: { token } });
  } catch (err) {
    return res.status(503).json({ message: 'Service error. Please try again later' });
  }
};
