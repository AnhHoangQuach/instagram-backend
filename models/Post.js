const mongoose = require('mongoose');
const Comment = require('./Comment');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');

const PostSchema = new mongoose.Schema({
  images: {
    type: [
      {
        width: Number,
        height: Number,
        format: String,
        url: String,
        secure_url: String,
      },
    ],
    validate: (v) => v === null || v.length > 0,
  },
  thumbnail: {
    type: [String],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  caption: String,
  hashtags: [{ type: String, lowercase: true }],
  type: {
    type: String,
    enum: ['public', 'private', 'share'],
    default: 'public',
  },
  likes: [{ user: { type: mongoose.Schema.ObjectId, ref: 'User' } }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

PostSchema.post('remove', async (doc) => {
  await Comment.deleteMany({ post: doc._id });
});

PostSchema.plugin(aggregatePaginate);

const Post = mongoose.model('Post', PostSchema);
module.exports = Post;
