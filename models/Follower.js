const mongoose = require('mongoose');

const FollowerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  followers: [
    {
      user: { type: mongoose.Schema.ObjectId, ref: 'User' },
    },
  ],

  following: [
    {
      user: { type: mongoose.Schema.ObjectId, ref: 'User' },
    },
  ],
});

const Follower = mongoose.model('Follower', FollowerSchema);
module.exports = Follower;
