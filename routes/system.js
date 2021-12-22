const express = require('express');
const systemRouter = express.Router();

const { search } = require('../controllers/systemController');

systemRouter.get('/search', search);

module.exports = systemRouter;
