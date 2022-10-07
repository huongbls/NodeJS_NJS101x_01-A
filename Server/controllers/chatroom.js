const Chatroom = require("../models/chatroom");
const io = require("../socket");

exports.getMessageByRoomId = async (req, res, next) => {
  try {
    const roomId = req.query.roomId;
    const chatroom = await Chatroom.findById(roomId);
    res.status(200).json(chatroom.content.chat);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.addMessage = async (req, res, next) => {
  try {
    const roomId = req.body.roomId;
    const message = req.body.message;
    const isAdmin = req.body.is_admin;
    if (await Chatroom.findById(roomId)) {
      const chatroom = await Chatroom.findById(roomId);
      const chatArr = chatroom.content.chat;
      const newChat = [
        {
          is_admin: isAdmin,
          message: message,
        },
      ];
      const updatedChatArr = [...chatArr, ...newChat];
      await Chatroom.findOneAndUpdate(
        { _id: req.body.roomId },
        { content: { chat: updatedChatArr } },
        { new: true }
      );
      res.status(200).json(chatroom.content.message);
    }
    io.getIO().emit("receive_message", { action: "addMessage" });
    // const chatroom = await Chatroom.findById(roomId);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.createNewRoom = async (req, res, next) => {
  try {
    // const newChatroom = await Chatroom.findOne();
    // if (!newChatroom) {
    const newChatroom = new Chatroom();
    await newChatroom.save();
    res.status(200).json(newChatroom);
    // }
    io.getIO().emit("receive_message", { action: "createNewRoom" });
    // res.status(200).json(newChatroom);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getAllChatroom = async (req, res, next) => {
  try {
    const allChatroom = await Chatroom.find();
    res.status(200).json(allChatroom);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// getMessageByRoomId: (roomId) => {
// 	const url = `/chatrooms/getById?roomId=${roomId}`;
// 	return axiosClient.get(url);
// },

// createNewRoom: () => {
// 	const url = `/chatrooms/createNewRoom`;
// 	return axiosClient.post(url);
// },

// addMessage: (body) => {
// 	const url = `/chatrooms/addMessage`;
// 	return axiosClient.put(url, body);
// },
