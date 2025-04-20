const mongoose = require("mongoose");
const groupChatModel = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    members: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    groupPic: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Group = mongoose.model("Group", groupChatModel);
module.exports = Group;
