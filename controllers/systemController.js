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

    var result = await Post.find();

    var hashtags = result
      .map((post) => post.hashtags.filter((tag) => tag.indexOf(keyword) > -1))
      .flat();

    return res.status(200).json({ status: 'success', data: { users, hashtags } });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
};
