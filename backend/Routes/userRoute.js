const express = require("express");
const jwt = require("jsonwebtoken");

const {
  signupController,
  loginController,
  logOutController,
  fetchAllUsers,
  getUserDetails,
  searchUsers,
  getChatUser,
  addToChatList,
  chatlist,
  updateUserDetails,
} = require("../controller/userController");
const isLoggedIn = require("../middleware/isLoggedIn");
const { ai } = require("../controller/ai");
const checkAuth = require("../middleware/checkAuth");

const Router = express.Router();

Router.post("/login", loginController);
Router.post("/signup", signupController);
Router.post("/logout", logOutController);
Router.get("/get-user-details", isLoggedIn, getUserDetails);
Router.get("/fetchAllUsers", isLoggedIn, fetchAllUsers);
Router.post("/ai", ai);
Router.get("/searchUsers", isLoggedIn, searchUsers);
Router.get("/get-chat-user/:id", getChatUser);
Router.get("/check-auth", checkAuth);
Router.post("/add-to-chat-list", isLoggedIn, addToChatList);
Router.get("/chatList", isLoggedIn, chatlist);
Router.post("/update-profile", isLoggedIn, updateUserDetails);

module.exports = Router;
