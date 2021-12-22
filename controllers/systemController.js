const User = require('../models/User');
const Post = require('../models/Post');

module.exports.search = async (req, res, next) => {
  const { keyword } = req.query;
  try {
    const users = await User.aggregate([
      {
        $match: {
          username: { $regex: new RegExp(keyword), $options: 'i' },
        },
      },
      {
        $lookup: {
          from: 'followers',
          localField: '_id',
          foreignField: 'user',
          as: 'followers',
        },
      },
      {
        $unwind: '$followers',
      },
      {
        $addFields: {
          followersCount: { $size: '$followers.followers' },
        },
      },
      {
        $sort: { followersCount: -1 },
      },
      {
        $project: {
          _id: true,
          username: true,
          avatar: true,
          fullname: true,
        },
      },
    ]);

    const posts = await Post.aggregate([
      {
        $match: {
          hashtags: { $regex: new RegExp(keyword), $options: 'i' },
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
        $addFields: {
          commentCount: '$commentCount.count',
        },
      },
      { $sort: { likes: -1 } },
      {
        $project: {
          _id: true,
          commentCount: true,
          likes: true,
          images: true,
        },
      },
    ]);

    return res.status(200).json({ status: 'success', data: { users, posts } });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
};
