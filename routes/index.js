const express = require('express');
const authRouter = require('./auth');
const healthRouter = require('./health');
const postRouter = require('./post');
const userRouter = require('./user');

const apiRouter = express.Router();

apiRouter.use('/auth', authRouter);

apiRouter.use('/health', healthRouter);

apiRouter.use('/post', postRouter);

apiRouter.use('/user', userRouter);

module.exports = apiRouter;
