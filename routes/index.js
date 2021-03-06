const express = require('express');
const authRouter = require('./auth');
const healthRouter = require('./health');
const postRouter = require('./post');
const userRouter = require('./user');
const commentRouter = require('./comment');
const systemRouter = require('./system');
const chatRouter = require('./chat');
const notificationRouter = require('./notification');
const adminRouter = require('./admin');

const apiRouter = express.Router();

apiRouter.use('/auth', authRouter);

apiRouter.use('/health', healthRouter);

apiRouter.use('/post', postRouter);

apiRouter.use('/user', userRouter);

apiRouter.use('/comment', commentRouter);

apiRouter.use('/system', systemRouter);

apiRouter.use('/chat', chatRouter);

apiRouter.use('/notification', notificationRouter);

apiRouter.use('/admin', adminRouter);

module.exports = apiRouter;
