const User = require('../models/User');
const Follower = require('../models/Follower');
const Chat = require('../models/Chat');
const VerifyCode = require('../models/VerifyCode');
const bcrypt = require('bcrypt');
const {
  validateEmail,
  validateFullName,
  validateUsername,
  validatePassword,
} = require('../utils/validation');
const mailConfig = require('../utils/mail');
const { checkVerifyCode, removeVerifyCode } = require('../utils/helpers');

module.exports.signup = async (req, res) => {
  const { username, fullname, email, password, role } = req.body;

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
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const user = await User.create({ username, fullname, email, password: passwordHash, role });
    const token = user.getToken();
    await new Follower({ user: user._id, followers: [], following: [] }).save();
    await new Chat({ user: user._id, chats: [] }).save();
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
      return res.status(400).json({ status: 'error', message: 'Email or password is incorrect' });

    if (user.isBlocked) {
      return res.status(400).json({
        status: 'error',
        message: 'Your account is blocked. Please contact the administrator',
      });
    }

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
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

module.exports.resetPassword = async (req, res) => {
  try {
    const { email, verifyCode, password } = req.body;

    const { status, message } = await checkVerifyCode(verifyCode, email);
    if (status === 'error') {
      return res.status(400).json({ message });
    }

    const newPasswordError = validatePassword(password);
    if (newPasswordError)
      return res.status(400).json({ status: 'error', message: newPasswordError });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    await User.updateOne({ email }, { password: passwordHash });

    removeVerifyCode(email);
    return res.status(200).json({ status: 'success', message: 'Change Password Successfully' });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

const generateVerifyCode = (numberOfDigits) => {
  const n = parseInt(numberOfDigits);
  const number = Math.floor(Math.random() * Math.pow(10, n)) + 1;
  let numberStr = number.toString();
  const l = numberStr.length;
  for (let i = 0; i < 6 - l; ++i) {
    numberStr = '0' + numberStr;
  }
  return numberStr;
};

module.exports.getVerifyCode = async (req, res) => {
  try {
    const { email } = req.query;
    if (!Boolean(email)) {
      return res.status(400).json({ status: 'error', message: 'Email is not exist' });
    }

    const isExist = await User.exists({ email });
    if (!isExist) {
      return res.status(400).json({ status: 'error', message: 'Email is not exist' });
    }

    const verifyCode = generateVerifyCode(6);

    const mail = {
      to: email,
      subject: 'Hama Instagram - Code for change password',
      html: mailConfig.htmlResetPassword(verifyCode),
    };

    await mailConfig.sendEmail(mail);
    try {
      // delete old code
      await VerifyCode.deleteOne({ email });

      await VerifyCode.create({
        code: verifyCode,
        email,
        createdDate: new Date(),
      });
    } catch (error) {
      return res.status(500).json({ status: 'error', message: error.message });
    }

    return res
      .status(200)
      .json({ status: 'success', message: 'Code sent successfully. Please check your email' });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};
