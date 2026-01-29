const mongoose = require("mongoose");

const groupChatModel = mongoose.Schema(
  {
    groupName: {
      type: String,
      required: true,
    },
    groupDescription: {
      type: String,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    admin: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    pic: {
      type: String,
    },
  },
  { timestamps: true }
);

const Group = mongoose.model("Group", groupChatModel);
module.exports = Group;
