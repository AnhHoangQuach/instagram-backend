const mongoose = require('mongoose');

const FollowersSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  followers: [
    {
      user: {
        type: Schema.ObjectId,
        ref: 'User',
      },
    },
  ],
});

const Followers = mongoose.model('Followers', FollowersSchema);
module.exports = Followers;
