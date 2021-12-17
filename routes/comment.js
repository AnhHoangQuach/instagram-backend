const express = require('express');
const commentRouter = express.Router();
const authMiddleware = require('../middlewares/auth');

const { createComment, deleteComment } = require('../controllers/commentController');

commentRouter.post('/:postId', authMiddleware.protect, createComment);

commentRouter.delete('/:commentId', authMiddleware.protect, deleteComment);

module.exports = commentRouter;
