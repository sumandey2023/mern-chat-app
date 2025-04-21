const asyncHandler = require("express-async-handler");
const groupChatModel = require("../model/groupChatModel");

const createGroup = asyncHandler(async (req, res) => {
  const { groupName, groupDescription, members, pic, admin } = req.body;
  try {
    const newGroup = await groupChatModel.create({
      groupName,
      groupDescription,
      members,
      pic,
      admin,
    });
    res.status(201).json({
      message: "Group created",
      group: newGroup,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating group", error: error.message });
  }
});

const getGroupsForUser = async (req, res) => {
  try {
    const userId = req.user._id; // You can get this from your auth middleware

    const groups = await groupChatModel.find({ members: userId });

    res.status(200).json(groups);
  } catch (error) {
    console.error("Failed to get user groups:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { createGroup, getGroupsForUser };
