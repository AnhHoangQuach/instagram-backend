const express = require('express');
const authRouter = require('./auth');
const healthRouter = require('./health');

const apiRouter = express.Router();

apiRouter.use('/auth', authRouter);

apiRouter.use('/health', healthRouter);

module.exports = apiRouter;
