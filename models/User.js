const mongoose = require('mongoose');
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
    default:
      'https://res.cloudinary.com/instagram-cloud-store/image/upload/v1639994777/default_tk6vnk.jpg',
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

const User = mongoose.model('User', UserSchema);
module.exports = User;
