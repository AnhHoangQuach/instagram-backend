const express = require('express');
const chatRouter = express.Router();
const authMiddleware = require('../middlewares/auth');

const { getChats, deleteChat } = require('../controllers/chatController');

chatRouter.get('/', authMiddleware.protect, getChats);

chatRouter.delete('/:messagesWith', authMiddleware.protect, deleteChat);

module.exports = chatRouter;
