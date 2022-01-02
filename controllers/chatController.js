const Chat = require('../models/Chat');

module.exports.getChats = async (req, res, next) => {
  const user = req.user;

  const chatUser = await Chat.findOne({ user: user._id }).populate('chats.messagesWith');

  try {
    let chatsToBeSent = [];
    if (chatUser.chats.length > 0) {
      chatsToBeSent = await chatUser.chats.map((chat) => ({
        messagesWith: chat.messagesWith._id,
        username: chat.messagesWith.username,
        avatar: chat.messagesWith.avatar,
        lastMessage: chat.messages[chat.messages.length - 1],
        createdAt: chat.messages[chat.messages.length - 1].createdAt,
      }));
    }

    chatsToBeSent.sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    return res.status(200).json({ status: 'success', data: { messages: chatsToBeSent } });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

module.exports.deleteChat = async (req, res, next) => {
  try {
    const user = req.user;
    const { messagesWith } = req.params;

    const chatUser = await Chat.findOne({ user: user._id });

    const chatToDelete = chatUser.chats.find(
      (chat) => chat.messagesWith.toString() === messagesWith
    );

    if (!chatToDelete) {
      return res.status(400).json({ status: 'error', message: 'Chat not found' });
    }

    const indexOf = chatUser.chats
      .map((chat) => chat.messagesWith.toString())
      .indexOf(messagesWith);

    chatUser.chats.splice(indexOf, 1);

    await chatUser.save();

    return res.status(200).json({ status: 'success', message: 'Chat deleted' });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
};
