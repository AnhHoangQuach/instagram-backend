const express = require('express');
const postRouter = express.Router();
const authMiddleware = require('../middlewares/auth');

const multer = require('multer');

const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now());
  },
});

const upload = multer({ storage });

const {
  createPost,
  getPost,
  getPosts,
  getFeedPosts,
  votePost,
  retrieveHashtagPosts,
  getExplorePosts,
  deletePost,
  editPost,
} = require('../controllers/postController');

postRouter.post('/create', authMiddleware.protect, upload.array('pictures', 10), createPost);

postRouter.get('/feed', authMiddleware.protect, getFeedPosts);

postRouter.get('/explore', authMiddleware.protect, getExplorePosts);

postRouter.get('/:postId', getPost);

postRouter.get('/', getPosts);

postRouter.put('/:postId', authMiddleware.protect, editPost);

postRouter.post('/:postId', authMiddleware.protect, votePost);

postRouter.delete('/:postId', authMiddleware.protect, deletePost);

postRouter.get('/hashtag/:hashtag', retrieveHashtagPosts);

module.exports = postRouter;
