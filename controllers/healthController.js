module.exports.healthCheck = (req, res, next) => {
  return res.status(200).send({ status: 'success', data: 'Instagram server is up and running' });
};
