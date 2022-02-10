require('dotenv').config();
const express = require('express');
const connectToDb = require('./utils/db');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'https://hippo-instagram.herokuapp.com'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  },
});

//require use for socket
const { addUser, removeUser, findConnectedUser } = require('./utils/room');
const { loadMessages, sendMsg, deleteMsg } = require('./utils/helpers');

//model
const User = require('./models/User');

const apiRouter = require('./routes');

app.use(cors());
app.use(passport.initialize());
app.use(express.json());

app.use('/api', apiRouter);

connectToDb();

passport.serializeUser((user, done) => {
  done(null, user.email);
});

passport.deserializeUser((email, done) => {
  User.findOne({ email: email }, (err, user) => {
    done(err, user);
  });
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
                'https://res.cloudinary.com/instagram-cloud-store/image/upload/v1639994777/default_tk6vnk.jpg',
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

//socket io
io.on('connection', (socket) => {
  console.log('Socket start working');
  socket.on('join', async ({ userId }) => {
    const users = await addUser(userId, socket.id);
    setInterval(() => {
      socket.emit('connected-users', {
        users: users.filter((user) => user.userId !== userId),
      });
    }, 5000);
  });

  socket.on('load-messages', async ({ userId, messagesWith }) => {
    const { data, status } = await loadMessages(userId, messagesWith);

    status !== 'error' ? socket.emit('messages-loaded', { data }) : socket.emit('no-chat-found');
  });

  socket.on('send-new-msg', async ({ userId, msgSendToUserId, msg }) => {
    const { status, data } = await sendMsg(userId, msgSendToUserId, msg);
    const receiverSocket = findConnectedUser(msgSendToUserId);

    if (receiverSocket) {
      // WHEN YOU WANT TO SEND MESSAGE TO A PARTICULAR SOCKET
      io.to(receiverSocket.socketId).emit('new-msg-received', { data });
    }

    status !== 'error' && socket.emit('msg-sent', { data });
  });

  socket.on('delete-msg', async ({ userId, messagesWith, messageId }) => {
    const { status } = await deleteMsg(userId, messagesWith, messageId);

    if (status === 'success') socket.emit('msg-deleted');
  });

  socket.on('disconnect', () => {
    console.log(`Remover user ${socket.id}`);
    removeUser(socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
