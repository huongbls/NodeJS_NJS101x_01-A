const express = require("express");

const chatroomController = require("../controllers/chatroom");

const router = express.Router();

router.get("/getById", chatroomController.getMessageByRoomId);

router.get("/getAllChatroom", chatroomController.getAllChatroom);

router.post("/createNewRoom", chatroomController.createNewRoom);

router.put("/addMessage", chatroomController.addMessage);

module.exports = router;
