require('dotenv').config();
const express = require('express');
const connectToDb = require('./utils/db');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;

//model
const User = require('./models/User');

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
    function async(accessToken, refreshToken, profile, done) {
      process.nextTick(function () {
        User.findOne({ email: profile.emails[0].value }, (err, user) => {
          if (err) return done(err);

          if (user) {
            return done(null, user);
          } else {
            var newUser = new User({
              email: profile.emails[0].value,
              fullname: profile.name.familyName + ' ' + profile.name.givenName,
              username: 'userfb',
              password: '123456',
              avatar:
                profile.photos[0].value ||
                'https://res.cloudinary.com/instagram-cloud-store/image/upload/v1635824574/default_gwdper.jpg',
            });

            newUser.save((err) => {
              if (err) throw err;
              return done(null, newUser);
            });
          }
        });
      });
    }
  )
);

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
