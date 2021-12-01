const cloudinary = require('cloudinary').v2;
const { formatCloudinaryUrl } = require('../utils/helpers');
const Post = require('../models/Post');
const ObjectId = require('mongoose').Types.ObjectId;

module.exports.createPost = async (req, res, next) => {
  const user = req.user;
  const { caption, hashtags } = req.body;
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
    const thumbnailUrl = imageResponses.map((item) => {
      return formatCloudinaryUrl(
        item.secure_url,
        {
          width: 400,
          height: 400,
        },
        true
      );
    });

    const imagesFormat = imageResponses.map(({ width, height, format, url, secure_url }) => {
      return { width, height, format, url, secure_url };
    });
    const post = await Post.create({
      images: imagesFormat,
      thumbnail: thumbnailUrl,
      user: user._id,
      caption,
      hashtags,
    });
    res.status(200).json({ status: 'success', data: { post } });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

module.exports.getPost = async (req, res, next) => {
  const { postId } = req.params;
  try {
    const post = await Post.aggregate([
      { $match: { _id: ObjectId(postId) } },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $unset: ['user.password'],
      },
    ]);
    if (post.length === 0) {
      return res
        .status(404)
        .json({ status: 'error', message: 'Could not find a post with that id.' });
    }

    res.status(200).json({ status: 'success', data: { post: post[0] } });
  } catch (err) {
    return res.status(404).json({ status: 'error', message: err.message });
  }
};

module.exports.getPosts = async (req, res, next) => {
  const { page, limit, orderBy, user, hashtags } = req.query;
  const orderByValue = orderBy === 'desc' ? -1 : 1;
  if (parseInt(page) == 0) {
    return res.status(404).json({ status: 'error', message: 'Page number not zero' });
  }

  let pipeline = [
    { $sort: { createdAt: orderByValue } },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },
    {
      $unset: ['user.password'],
    },
    { $skip: parseInt(page - 1) * parseInt(limit) },
    { $limit: parseInt(limit) },
  ];

  if (user) {
    pipeline.unshift({
      $match: { user: ObjectId(user) },
    });
  }

  if (hashtags) {
    pipeline.push({
      $match: { hashtags: { $in: hashtags } },
    });
  }

  try {
    const posts = await Post.aggregate(pipeline);
    if (posts.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Could not find any posts.' });
    }
    res.status(200).json({ status: 'success', data: { posts } });
  } catch (err) {
    return res.status(404).json({ status: 'error', message: err.message });
  }
};
