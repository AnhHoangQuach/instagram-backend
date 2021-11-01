const express = require('express');
const healthRouter = express.Router();

const { healthCheck } = require('../controllers/healthController');

healthRouter.get('/check', healthCheck);

module.exports = healthRouter;
