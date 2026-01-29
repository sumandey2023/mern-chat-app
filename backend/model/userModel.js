const mongoose = require("mongoose");
const userModel = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    chatlist: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    pic: {
      type: String,
    },
    video: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userModel);
module.exports = User;
