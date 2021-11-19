const express = require('express');
const postRouter = express.Router();

const multer = require('multer');

const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now());
  },
});

const upload = multer({ storage });

const { createPost } = require('../controllers/postController');

postRouter.post('/create', upload.array('pictures', 10), createPost);

module.exports = postRouter;
