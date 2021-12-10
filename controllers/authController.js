const User = require('../models/User');
const Follower = require('../models/Follower');

const {
  validateEmail,
  validateFullName,
  validateUsername,
  validatePassword,
} = require('../utils/validation');

module.exports.signup = async (req, res) => {
  const { username, fullname, email, password } = req.body;

  const usernameError = validateUsername(username);
  if (usernameError) return res.status(400).json({ status: 'error', message: usernameError });

  const fullNameError = validateFullName(fullname);
  if (fullNameError) return res.status(400).json({ status: 'error', message: fullNameError });

  const emailError = validateEmail(email);
  if (emailError) return res.status(400).json({ status: 'error', message: emailError });

  const passwordError = validatePassword(password);
  if (passwordError) return res.status(400).json({ status: 'error', message: passwordError });

  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist)
    return res.status(400).json({ status: 'fail', message: 'Email has already been registered' });

  try {
    const user = await User.create({ username, fullname, email, password });
    const token = user.getToken();
    await new Follower({ user: user._id, followers: [], following: [] }).save();
    res.status(200).json({ status: 'success', data: { token } });
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
    if (!user)
      return res.status(401).json({ status: 'error', message: 'Email or password is incorrect' });

    const isMatch = await user.checkPassword(password);
    if (!isMatch)
      return res.status(401).json({ status: 'error', message: 'Email or password is incorrect' });

    const token = user.getToken();
    return res.status(200).json({ status: 'success', data: { token } });
  } catch (err) {
    return res.status(503).json({ message: 'Service error. Please try again later' });
  }
};

module.exports.getMe = (req, res) => {
  try {
    const { isAuth = false } = res.locals;
    if (!isAuth) {
      return res.status(401).json({ status: 'error', message: 'Failed' });
    }
    res.status(200).json({
      data: { user: req.user },
      status: 'success',
    });
  } catch (err) {
    return res.status(401).json({ status: 'error', message: err.message });
  }
};
