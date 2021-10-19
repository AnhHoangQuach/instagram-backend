const jwt = require('jsonwebtoken');

module.exports.requireAuth = async (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer ', '');
  if (!token) {
    return res.status(401).send({ error: 'Not authorized.' });
  }
  try {
    const user = await jwt.verify(token, process.env.JWT_SECRET);
    res.locals.user = user;
    return next();
  } catch (err) {
    return res.status(401).send({ error: err });
  }
};
