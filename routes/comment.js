const express = require('express');
const commentRouter = express.Router();
const authMiddleware = require('../middlewares/auth');

const { createComment } = require('../controllers/commentController');

commentRouter.post('/:postId', authMiddleware.protect, createComment);

module.exports = commentRouter;
