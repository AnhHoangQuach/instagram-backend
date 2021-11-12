const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(403).send({ error: 'You need to be logged in to visit this route' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(400).send({ error: `No user found for ID ${decoded.id}` });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(403).send({ error: 'You need to be logged in to visit this route' });
  }
};
