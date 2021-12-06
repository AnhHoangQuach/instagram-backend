const express = require('express');
const userRouter = express.Router();
const authMiddleware = require('../middlewares/auth');

const { getUser, bookmarkPost, followUser } = require('../controllers/userController');

userRouter.get('/:userId', getUser);

userRouter.post('/:postId/bookmark', authMiddleware.protect, bookmarkPost);

userRouter.post('/:userId/follow', authMiddleware.protect, followUser);

module.exports = userRouter;
