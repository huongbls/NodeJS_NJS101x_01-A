const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const chatroomSchema = new Schema({
  content: {
    chat: [
      {
        is_admin: { type: Boolean },

        message: { type: String },
      },
    ],
  },
});

module.exports = mongoose.model("Chatroom", chatroomSchema);
