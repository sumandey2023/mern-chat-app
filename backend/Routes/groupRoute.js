const express = require("express");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const isLoggedIn = require("../middleware/isLoggedIn");
const {
  createGroup,
  getGroupsForUser,
} = require("../controller/groupController");
const Router = express.Router();

Router.post("/createGroup", upload.single("pic"), isLoggedIn, createGroup);
Router.get("/getGroups", isLoggedIn, getGroupsForUser);

module.exports = Router;
