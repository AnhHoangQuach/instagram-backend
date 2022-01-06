const express = require('express');
const userRouter = express.Router();
const authMiddleware = require('../middlewares/auth');
const multer = require('multer');

const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now());
  },
});

const upload = multer({ storage });

const {
  getUser,
  bookmarkPost,
  followUser,
  unfollowUser,
  getFollowing,
  getFollowers,
  updateProfile,
  changeAvatar,
  changePassword,
  retrieveSuggestedUsers,
  getStories,
} = require('../controllers/userController');

userRouter.get('/:userId', getUser);

userRouter.get('/suggested/:max?', authMiddleware.protect, retrieveSuggestedUsers);

userRouter.post('/:postId/bookmark', authMiddleware.protect, bookmarkPost);

userRouter.post('/:userId/follow', authMiddleware.protect, followUser);

userRouter.put('/:userId/unfollow', authMiddleware.protect, unfollowUser);

userRouter.get('/:userId/following', getFollowing);

userRouter.get('/:userId/followers', getFollowers);

userRouter.get('/:userId/stories', getStories);

userRouter.put('/update', authMiddleware.protect, updateProfile);

userRouter.put('/avatar', authMiddleware.protect, upload.single('avatar'), changeAvatar);

userRouter.put('/password', authMiddleware.protect, changePassword);

module.exports = userRouter;
