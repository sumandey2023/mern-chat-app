const mongoose = require("mongoose");
const chatModel = mongoose.Schema({
  chatName: {
    type: String,
    trim: true,
  },
  isGroupChat: {
    type: Boolean,
  },
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  groupAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  latestMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message",
  },
});

const Chat = mongoose.model("Chat", chatModel);
module.exports = Chat;
