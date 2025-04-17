const express = require("express");
const { getMessages, sendMessage } = require("../controller/messageController");
const isLoggedIn = require("../middleware/isLoggedIn");
const Router = express.Router();

//fecth one to one messages
Router.get("/:id", isLoggedIn, getMessages);
Router.post("/send/:id", isLoggedIn, sendMessage);

module.exports = Router;
