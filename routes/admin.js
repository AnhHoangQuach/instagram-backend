const express = require('express');
const adminRouter = express.Router();
const authMiddleware = require('../middlewares/auth');

const { fetchUsers, fetchPosts } = require('../controllers/adminController');

adminRouter.get('/users', authMiddleware.isAdmin, fetchUsers);

adminRouter.get('/posts', authMiddleware.isAdmin, fetchPosts);

module.exports = adminRouter;
