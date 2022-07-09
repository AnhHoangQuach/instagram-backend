const express = require('express');
const systemRouter = express.Router();

const { search, checkHealth } = require('../controllers/systemController');

systemRouter.get('/search', search);

systemRouter.get('/healthy', checkHealth);

module.exports = systemRouter;
