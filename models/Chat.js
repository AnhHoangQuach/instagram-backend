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
          date: { type: Date },
        },
      ],
    },
  ],
});

const Chat = mongoose.model('Chat', ChatSchema);
module.exports = Chat;
