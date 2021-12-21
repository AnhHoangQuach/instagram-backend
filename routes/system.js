const express = require('express');
const systemRouter = express.Router();

const { search } = require('../controllers/systemController');

systemRouter.post('/search', search);

module.exports = systemRouter;
