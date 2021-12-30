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
      return { status: 'error', message: 'No chat found' };
    }

    return { status: 'success', data: { chat } };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
};

module.exports.sendMsg = async (userId, msgSendToUserId, msg) => {
  try {
    // LOGGED IN USER (SENDER)
    const user = await Chat.findOne({ user: userId });

    // RECEIVER
    const msgSendToUser = await Chat.findOne({ user: msgSendToUserId });

    const newMsg = {
      sender: userId,
      receiver: msgSendToUserId,
      msg,
      date: Date.now(),
    };

    const previousChat = user.chats.find(
      (chat) => chat.messagesWith.toString() === msgSendToUserId
    );

    if (previousChat) {
      previousChat.messages.push(newMsg);
      await user.save();
    }
    //
    else {
      const newChat = { messagesWith: msgSendToUserId, messages: [newMsg] };
      user.chats.unshift(newChat);
      await user.save();
    }

    const previousChatForReceiver = msgSendToUser.chats.find(
      (chat) => chat.messagesWith.toString() === userId
    );

    if (previousChatForReceiver) {
      previousChatForReceiver.messages.push(newMsg);
      await msgSendToUser.save();
    }
    //
    else {
      const newChat = { messagesWith: userId, messages: [newMsg] };
      msgSendToUser.chats.unshift(newChat);
      await msgSendToUser.save();
    }

    return { status: 'success', data: { newMsg } };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
};

module.exports.deleteMsg = async (userId, messagesWith, messageId) => {
  try {
    const user = await Chat.findOne({ user: userId });

    const chat = user.chats.find((chat) => chat.messagesWith.toString() === messagesWith);

    if (!chat) return;

    const messageToDelete = chat.messages.find((message) => message._id.toString() === messageId);

    if (!messageToDelete) return;

    if (messageToDelete.sender.toString() !== userId) {
      return;
    }

    const indexOf = chat.messages
      .map((message) => message._id.toString())
      .indexOf(messageToDelete._id.toString());

    await chat.messages.splice(indexOf, 1);

    await user.save();

    return { status: 'success', message: 'Delete message successfully' };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
};
