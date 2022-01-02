const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  chats: [
    {
      messagesWith: { type: mongoose.Schema.ObjectId, ref: 'User' },
      messages: [
        {
          msg: { type: String, required: true },
          sender: { type: mongoose.Schema.ObjectId, ref: 'User' },
          receiver: { type: mongoose.Schema.ObjectId, ref: 'User' },
          createdAt: {
            type: Date,
            default: Date.now,
          },
          updatedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Chat = mongoose.model('Chat', ChatSchema);
module.exports = Chat;
