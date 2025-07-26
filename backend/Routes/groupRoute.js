const express = require("express");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const isLoggedIn = require("../middleware/isLoggedIn");
const {
  createGroup,
  getGroupsForUser,
  getGroupDetails,
  getGroupMemberList,
  sendGroupMessage,
  getAllChatOfGroup,
  addNewMembersToGroup,
  removeMemberFromGroup,
  makeAdminOfGroup,
  leaveGroup,
} = require("../controller/groupController");

const Router = express.Router();

Router.post("/createGroup", upload.single("pic"), isLoggedIn, createGroup);
Router.get("/getGroups", isLoggedIn, getGroupsForUser);
Router.get("/groupDetails/:id", isLoggedIn, getGroupDetails);
Router.get("/groupMemberList/:id", isLoggedIn, getGroupMemberList);
Router.post(
  "/sendMessage/:id",

  isLoggedIn,
  sendGroupMessage
);
Router.get("/allChats/:id", isLoggedIn, getAllChatOfGroup);
Router.post("/addNewMember", isLoggedIn, addNewMembersToGroup);
Router.post("/removeMember/:id", isLoggedIn, removeMemberFromGroup);
Router.post("/makeAdmin/:id", isLoggedIn, makeAdminOfGroup);
Router.get("/leaveGroup/:id", isLoggedIn, leaveGroup);
module.exports = Router;
