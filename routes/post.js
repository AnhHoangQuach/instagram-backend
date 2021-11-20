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

const { createPost, getPost } = require('../controllers/postController');

postRouter.post('/create', authMiddleware.protect, upload.array('pictures', 10), createPost);

postRouter.get('/:postId', getPost);

module.exports = postRouter;
