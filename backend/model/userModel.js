const mongoose = require("mongoose");
const iserModel = mongoose.Schema(
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
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", iserModel);
module.exports = User;
