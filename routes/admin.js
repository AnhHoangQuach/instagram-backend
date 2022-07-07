const express = require('express');
const adminRouter = express.Router();
const authMiddleware = require('../middlewares/auth');

const { fetchUsers, fetchPosts, deleteUser } = require('../controllers/adminController');

adminRouter.get('/users', authMiddleware.isAdmin, fetchUsers);

adminRouter.get('/posts', authMiddleware.isAdmin, fetchPosts);

adminRouter.delete('/user', authMiddleware.isAdmin, deleteUser);

module.exports = adminRouter;
