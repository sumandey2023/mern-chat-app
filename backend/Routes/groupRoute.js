const express = require("express");
const isLoggedIn = require("../middleware/isLoggedIn");
const {
  createGroup,
  getGroupsForUser,
} = require("../controller/groupController");
const Router = express.Router();

Router.post("/createGroup", isLoggedIn, createGroup);
Router.get("/getGroups", isLoggedIn, getGroupsForUser);

module.exports = Router;
