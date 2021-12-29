const Chat = require('../models/Chat');

/**
 * Formats a cloudinary thumbnail url with a specified size
 * @function formatCloudinaryUrl
 * @param {string} url The url to format
 * @param {size} number Desired size of the image
 * @return {string} Formatted url
 */
module.exports.formatCloudinaryUrl = (url, size, thumb) => {
  const splitUrl = url.split('upload/');
  splitUrl[0] += `upload/${size.y && size.z ? `x_${size.x},y_${size.y},` : ''}w_${size.width},h_${
    size.height
  }${thumb && ',c_thumb'}/`;
  const formattedUrl = splitUrl[0] + splitUrl[1];
  return formattedUrl;
};

module.exports.loadMessages = async (userId, messagesWith) => {
  try {
    const user = await Chat.findOne({ user: userId }).populate('chats.messagesWith');

    const chat = user.chats.find((chat) => chat.messagesWith._id.toString() === messagesWith);

    if (!chat) {
      return { error: 'No chat found' };
    }

    return { chat };
  } catch (error) {
    return { error };
  }
};
