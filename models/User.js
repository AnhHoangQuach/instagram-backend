const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please enter your username'],
    trim: true,
    unique: true,
  },
  email: {
    type: String,
    required: [true, 'Please enter your email'],
    trim: true,
    lowercase: true,
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Please enter your password'],
    minlength: [6, 'Password should be at least minimum of 6 characters'],
    maxlength: [12, 'Password should be maximum of 12 characters'],
  },
  avatar: {
    type: String,
    default: '',
  },
  bio: String,
  followers: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  followersCount: {
    type: Number,
    default: 0,
  },
  followingCount: {
    type: Number,
    default: 0,
  },
  following: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  posts: [{ type: mongoose.Schema.ObjectId, ref: 'Post' }],
  postCount: {
    type: Number,
    default: 0,
  },
  savedPosts: [{ type: mongoose.Schema.ObjectId, ref: 'Post' }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', UserSchema);
