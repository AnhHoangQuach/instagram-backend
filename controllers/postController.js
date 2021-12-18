const cloudinary = require('cloudinary').v2;
const { formatCloudinaryUrl } = require('../utils/helpers');
const Post = require('../models/Post');
const Follower = require('../models/Follower');
const ObjectId = require('mongoose').Types.ObjectId;
const { retrieveComments } = require('./commentController');

module.exports.createPost = async (req, res, next) => {
  const user = req.user;
  if (!user) {
    return res.status(404).json({ status: 'error', message: 'You need to be logged in' });
  }
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
    const comments = await retrieveComments(postId, 0);
    res.status(200).json({ status: 'success', data: { post: post[0], comment: comments } });
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
      $unset: ['user.password', 'user.savedPosts'],
    },
    {
      $lookup: {
        from: 'comments',
        let: { postId: '$_id' },
        pipeline: [
          {
            // Finding comments related to the postId
            $match: {
              $expr: {
                $eq: ['$post', '$$postId'],
              },
            },
          },
          { $sort: { date: -1 } },
          { $limit: 3 },
          // Populating the author field
          {
            $lookup: {
              from: 'users',
              localField: 'user',
              foreignField: '_id',
              as: 'user',
            },
          },

          {
            $unwind: '$user',
          },

          {
            $unset: ['user.password', 'user.savedPosts', 'user.email', 'user.website', 'user.bio'],
          },
        ],
        as: 'comments',
      },
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
    res.status(200).json({ status: 'success', data: { posts } });
  } catch (err) {
    return res.status(404).json({ status: 'error', message: err.message });
  }
};

module.exports.getFeedPosts = async (req, res, next) => {
  const user = req.user;
  const { page, limit } = req.query;
  if (parseInt(page) == 0) {
    return res.status(404).json({ status: 'error', message: 'Page number not zero' });
  }
  if (!user) {
    return res.status(404).json({ status: 'error', message: 'You need to be logged in' });
  }

  try {
    const followingDocument = await Follower.findOne({ user: user._id });
    if (!followingDocument) {
      return res.status(404).send({ error: 'Could not find any posts.' });
    }
    const following = followingDocument.following.map((following) => following.user);

    // Fields to not include on the user object
    const unwantedUserFields = [
      'user.password',
      'user.savedPosts',
      'user.email',
      'user.website',
      'user.bio',
    ];
    const posts = await Post.aggregate([
      {
        $match: {
          $or: [{ user: { $in: following } }, { user: ObjectId(user._id) }],
        },
      },
      { $sort: { date: -1 } },
      { $skip: parseInt(page - 1) * parseInt(limit) },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $lookup: {
          from: 'comments',
          let: { postId: '$_id' },
          pipeline: [
            {
              // Finding comments related to the postId
              $match: {
                $expr: {
                  $eq: ['$post', '$$postId'],
                },
              },
            },
            { $sort: { date: -1 } },
            { $limit: 3 },
            // Populating the author field
            {
              $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'user',
              },
            },
            {
              $unwind: '$user',
            },
            {
              $unset: unwantedUserFields,
            },
          ],
          as: 'comments',
        },
      },
      {
        $lookup: {
          from: 'comments',
          let: { postId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$post', '$$postId'],
                },
              },
            },
            {
              $group: { _id: null, count: { $sum: 1 } },
            },
            {
              $project: {
                _id: false,
              },
            },
          ],
          as: 'commentCount',
        },
      },
      {
        $unwind: {
          path: '$commentCount',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: '$user',
      },
      {
        $addFields: {
          commentData: {
            comments: '$comments',
            commentCount: '$commentCount.count',
          },
        },
      },
      {
        $unset: [...unwantedUserFields, 'comments', 'commentCount'],
      },
    ]);

    return res.status(200).json({ status: 'success', data: { posts } });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

module.exports.votePost = async (req, res, next) => {
  const { postId } = req.params;
  const user = req.user;
  if (!user) {
    return res.status(404).json({ status: 'error', message: 'You need to be logged in' });
  }
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).send('No Post found');
    }

    const isLiked = post.likes.filter((like) => like.user.toString() === user.id).length > 0;
    if (isLiked) {
      const index = post.likes.map((like) => like.user.toString()).indexOf(user.id);

      await post.likes.splice(index, 1);
      await post.save();

      return res.status(200).json({ status: 'success', message: 'Unlike post successfully' });
    } else {
      await post.likes.unshift({ user: user._id });
      await post.save();

      return res.status(200).json({ status: 'success', message: 'Like post successfully' });
    }
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
};
