const express = require('express');
const authRouter = express.Router();

const { signup, login } = require('../controllers/authController');

authRouter.post('/signup', signup);

authRouter.post('/login', login);

module.exports = authRouter;
