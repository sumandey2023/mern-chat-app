const express = require("express");
const {
  getMessages,
  sendMessage,
  deleteMessage,
} = require("../controller/messageController");
const isLoggedIn = require("../middleware/isLoggedIn");
const Router = express.Router();

Router.get("/:id", isLoggedIn, getMessages);
Router.post("/send/:id", isLoggedIn, sendMessage);
Router.delete("/:id", isLoggedIn, deleteMessage);

module.exports = Router;
