const mongoose = require('mongoose');

const FollowingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  following: [
    {
      user: {
        type: Schema.ObjectId,
        ref: 'User',
      },
    },
  ],
});

const Following = mongoose.model('Following', FollowingSchema);
module.exports = Following;
