const express = require('express');
const userRouter = express.Router();
const authMiddleware = require('../middlewares/auth');

const {
  getUser,
  bookmarkPost,
  followUser,
  unfollowUser,
  getFollowing,
  getFollowers,
  updateProfile,
} = require('../controllers/userController');

userRouter.get('/:userId', getUser);

userRouter.post('/:postId/bookmark', authMiddleware.protect, bookmarkPost);

userRouter.post('/:userId/follow', authMiddleware.protect, followUser);

userRouter.put('/:userId/unfollow', authMiddleware.protect, unfollowUser);

userRouter.get('/:userId/following', getFollowing);

userRouter.get('/:userId/followers', getFollowers);

userRouter.post('/update', authMiddleware.protect, updateProfile);

module.exports = userRouter;
