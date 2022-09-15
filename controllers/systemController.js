const User = require('../models/User');
const Post = require('../models/Post');

module.exports.search = async (req, res, next) => {
  const { keywords } = req.query;
  try {
    const users = await User.aggregate([
      {
        $match: {
          username: { $regex: new RegExp(keywords), $options: 'i' },
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

    var result = await Post.find();

    var hashtags = [
      ...new Set(
        result.map((post) => post.hashtags.filter((tag) => tag.indexOf(keywords) > -1)).flat()
      ),
    ];

    return res.status(200).json({ status: 'success', data: { users, hashtags } });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

module.exports.getSystem = async (req, res) => {
  try {
    const usersCount = await User.count({});
    const postsCount = await Post.count({});

    return res
      .status(200)
      .json({ data: { user_count: usersCount, post_count: postsCount }, status: 'success' });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
};
