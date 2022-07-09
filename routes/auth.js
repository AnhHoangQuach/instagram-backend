const express = require('express');
// const passport = require('passport');
const authRouter = express.Router();
const authMiddleware = require('../middlewares/auth');

const {
  signup,
  login,
  getMe,
  resetPassword,
  getVerifyCode,
} = require('../controllers/authController');

authRouter.post('/signup', signup);

authRouter.post('/login', login);

// authRouter.get('/facebook', passport.authenticate('facebook', { session: false, scope: 'email' }));

// authRouter.get(
//   '/facebook/callback',
//   passport.authenticate('facebook', {
//     failureRedirect: 'http://localhost:3000/signup',
//   }),
//   (req, res) => {
//     res.redirect('http://localhost:3000/login');
//   }
// );

authRouter.get('/me', authMiddleware.protect, getMe);

authRouter.post('/reset-password', resetPassword);

authRouter.get('/send-verify-code', getVerifyCode);

module.exports = authRouter;
