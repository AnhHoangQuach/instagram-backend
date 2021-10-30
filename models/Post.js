const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  images: {
    type: [String],
    validate: (v) => v === null || v.length > 0,
  },
  thumbnail: String,
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  caption: String,
  hashtags: [{ type: String, lowercase: true }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Post = mongoose.model('Post', PostSchema);
module.exports = Post;
