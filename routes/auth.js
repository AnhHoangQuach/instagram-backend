const express = require('express');
const passport = require('passport');
const authRouter = express.Router();

const { signup, login } = require('../controllers/authController');

authRouter.post('/signup', signup);

authRouter.post('/login', login);

authRouter.get('/facebook', passport.authenticate('facebook', { session: false, scope: 'email' }));

authRouter.get(
  '/facebook/callback',
  passport.authenticate('facebook', {
    failureRedirect: '/login',
  }),
  (req, res) => {
    res.redirect('facebook.com');
  }
);
module.exports = authRouter;
