const cloudinary = require('cloudinary').v2;
const { formatCloudinaryUrl } = require('../utils/helpers');

module.exports.createPost = async (req, res, next) => {
  const user = res.locals.user;

  if (!req.files) {
    return res.status(400).send({ error: 'Please provide the image to upload.' });
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  try {
    let pictureFiles = req.files;
    //Check if files exist
    if (!pictureFiles) return res.status(400).json({ message: 'No picture attached!' });
    //map through images and create a promise array using cloudinary upload function
    let multiplePicturePromise = pictureFiles.map((picture) =>
      cloudinary.uploader.upload(picture.path, { resource_type: 'auto' })
    );
    // await all the cloudinary upload functions in promise.all, exactly where the magic happens
    let imageResponses = await Promise.all(multiplePicturePromise);
    res.status(200).json({ images: imageResponses });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};
