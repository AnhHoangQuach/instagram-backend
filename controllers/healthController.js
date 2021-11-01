module.exports.healthCheck = (req, res, next) => {
  return res.status(200).send({ message: 'Instagram server is up and running' });
};
