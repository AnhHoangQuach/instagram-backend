const mongoose = require('mongoose');
const Comment = require('./Comment');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please enter your email'],
    trim: true,
    lowercase: true,
    unique: true,
    validate: (value) => {
      if (!validator.isEmail(value)) {
        throw new Error('Invalid email address.');
      }
    },
  },
  fullname: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: [true, 'Please enter your username'],
    trim: true,
    lowercase: true,
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Please enter your password'],
    minlength: [6, 'Password should be at least minimum of 6 characters'],
  },
  avatar: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    maxlength: 130,
  },
  website: {
    type: String,
    maxlength: 65,
  },
  savedPosts: [{ type: mongoose.Schema.ObjectId, ref: 'Post' }],
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

UserSchema.methods.getToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

UserSchema.methods.checkPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

UserSchema.post('remove', async (doc) => {
  await Post.deleteMany({ user: doc._id });
  await Comment.deleteMany({ user: doc._id });
  await Follower.deleteOne({ user: doc._id });
  await Chat.deleteOne({ user: doc._id });
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
