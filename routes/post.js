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
} = require('../controllers/postController');

postRouter.post('/create', authMiddleware.protect, upload.array('pictures', 10), createPost);

postRouter.get('/feed', authMiddleware.protect, getFeedPosts);

postRouter.get('/:postId', getPost);

postRouter.get('/', getPosts);

postRouter.post('/:postId', authMiddleware.protect, votePost);

postRouter.get('/hashtag/:hashtag/:offset', retrieveHashtagPosts);

module.exports = postRouter;
