const express = require('express');
const adminRouter = express.Router();
const authMiddleware = require('../middlewares/auth');

const { fetchUsers, fetchPosts, changeStatusUser } = require('../controllers/adminController');

adminRouter.get('/users', authMiddleware.isAdmin, fetchUsers);

adminRouter.get('/posts', authMiddleware.isAdmin, fetchPosts);

adminRouter.put('/user', authMiddleware.isAdmin, changeStatusUser);

module.exports = adminRouter;
