const mongoose = require('mongoose');

const verifyCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    maxLength: 6,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    maxLength: 100,
    required: true,
    trim: true,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

const VerifyCode = mongoose.model('verifyCode', verifyCodeSchema, 'verifyCodes');

module.exports = VerifyCode;
