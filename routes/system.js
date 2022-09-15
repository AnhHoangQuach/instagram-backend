const express = require('express');
const systemRouter = express.Router();
const authMiddleware = require('../middlewares/auth');

const { search, getSystem } = require('../controllers/systemController');

systemRouter.get('/', authMiddleware.isAdmin, getSystem);

systemRouter.get('/search', search);

module.exports = systemRouter;
