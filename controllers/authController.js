const jwt = require('jsonwebtoken');
const User = require('../models/User');

const {
  validateEmail,
  validateFullName,
  validateUsername,
  validatePassword,
} = require('../utils/validation');

module.exports.signup = async (req, res, next) => {
  const { username, fullname, email, password } = req.body;

  const usernameError = validateUsername(username);
  if (usernameError) return res.status(400).send({ error: usernameError });

  const fullNameError = validateFullName(fullname);
  if (fullNameError) return res.status(400).send({ error: fullNameError });

  const emailError = validateEmail(email);
  if (emailError) return res.status(400).send({ error: emailError });

  const passwordError = validatePassword(password);
  if (passwordError) return res.status(400).send({ error: passwordError });

  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist) return res.status(400).send({ error: 'Email has already been registered' });

  try {
    const user = await User.create({ username, fullname, email, password });
    const token = user.getToken();
    res.status(200).json({ token });
  } catch (err) {
    next(err);
  }
};

module.exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).send({ error: 'Email and password are required' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send({ error: 'Email or password is incorrect' });

    const isMatch = await user.checkPassword(password);
    if (!isMatch) return res.status(400).send({ error: 'Email or password is incorrect' });

    const token = user.getToken();
    res.status(200).json({ token });
  } catch (err) {
    next(err);
  }
};

module.exports.getMe = (req, res, next) => {
  const { avatar, username, fullname, email, _id, website, bio } = req.user;
  res.status(200).json({
    data: { avatar, username, fullname, email, _id, website, bio },
  });
};
