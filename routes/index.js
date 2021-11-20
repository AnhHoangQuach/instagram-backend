const express = require('express');
const authRouter = require('./auth');
const healthRouter = require('./health');
const postRouter = require('./post');

const apiRouter = express.Router();

apiRouter.use('/auth', authRouter);

apiRouter.use('/health', healthRouter);

apiRouter.use('/post', postRouter);

module.exports = apiRouter;
