const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports.protect = async (req, res, next) => {
  try {
    res.locals.isAuth = false;
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      next();
      return res
        .status(401)
        .send({ status: 'error', message: 'Unauthorized. You need login or sign up' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded) {
      let user = await User.findById(decoded.id).select('-password');

      if (user) {
        req.user = user;
        res.locals.isAuth = true;
      }
    }
    next();
  } catch (err) {
    return res.status(401).send({ status: 'error', message: err.message });
  }
};

module.exports.isAdmin = async (req, res, next) => {
  try {
    res.locals.isAuth = false;
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      next();
      return res
        .status(401)
        .send({ status: 'error', message: 'Unauthorized. You need login or sign up' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded) {
      let user = await User.findById(decoded.id).select('-password');

      if (user.role === 'admin') {
        req.user = user;
        res.locals.isAuth = true;
        next();
      }
    }
  } catch (err) {
    return res.status(401).send({ status: 'error', message: err.message });
  }
};
