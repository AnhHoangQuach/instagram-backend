require('dotenv').config();
const express = require('express');
const connectToDb = require('./utils/db');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;

const apiRouter = require('./routes');

app.use(cors());
app.use(passport.initialize());
app.use(express.json());

app.use('/api', apiRouter);

connectToDb();

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_ID,
      clientSecret: process.env.FACEBOOK_SECRET,
      callbackURL: process.env.CALLBACK_URL,
      profileFields: ['emails', 'name', 'photos'],
    },
    function (accessToken, refreshToken, profile, done) {
      process.nextTick(function () {
        console.log(accessToken, refreshToken, profile, done);
        return done(null, profile);
      });
    }
  )
);

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
