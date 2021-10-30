const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  receiver: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  notificationType: {
    type: String,
    enum: ['follow', 'like', 'comment', 'mention'],
  },
  notificationData: Object,
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Notification = mongoose.model('Notification', NotificationSchema);
module.exports = Notification;
