const asyncHandler = require("express-async-handler");
const groupChatModel = require("../model/groupChatModel");
const groupMessageModel = require("../model/groupMessageModel");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// const createGroup = asyncHandler(async (req, res) => {
//   const rawGroupInfo = req.body.groupInfo; // this is a JSON string
//   const groupInfo = JSON.parse(rawGroupInfo);

//   const { groupName, groupDescription, members, pic, admin } = groupInfo;

//   try {
//     const newGroup = await groupChatModel.create({
//       groupName,
//       groupDescription,
//       members,
//       pic,
//       admin,
//     });
//     res.status(201).json({
//       message: "Group created",
//       group: newGroup,
//     });
//   } catch (error) {
//     console.error("Error creating group:", error);
//     res
//       .status(500)
//       .json({ message: "Error creating group", error: error.message });
//   }
// });

const createGroup = asyncHandler(async (req, res) => {
  try {
    // Parse JSON from req.body.groupInfo
    const groupInfo = JSON.parse(req.body.groupInfo);
    const { groupName, groupDescription, members, admin } = groupInfo;

    let pic = null;

    // Check if file was uploaded
    if (req.file) {
      const buffer = req.file.buffer;
      const base64Image = buffer.toString("base64");

      const result = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${base64Image}`,
        {
          public_id: `${groupName}-group-pic` || undefined,
        }
      );

      pic = result.secure_url; // or store buffer, or upload to cloud
    }

    // Create the group with or without pic
    const newGroup = await groupChatModel.create({
      groupName,
      groupDescription,
      members,
      admin,
      pic,
    });

    res.status(201).json({
      message: "Group created",
      group: newGroup,
    });
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).json({
      message: "Error creating group",
      error: error.message,
    });
  }
});

const getGroupsForUser = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id; // You can get this from your auth middleware

    const groups = await groupChatModel.find({ members: userId });

    res.status(200).json(groups);
  } catch (error) {
    console.error("Failed to get user groups:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

const getGroupDetails = asyncHandler(async (req, res) => {
  try {
    const groupId = req.params.id;
    const groupDetails = await groupChatModel.findById(groupId);
    res.status(200).json(groupDetails);
  } catch (error) {
    console.log(error.message);

    res.status(500).send("Internal server error");
  }
});

const getGroupMemberList = asyncHandler(async (req, res) => {
  try {
    const groupId = req.params.id;
    const groupMembers = await groupChatModel
      .findById(groupId)
      .populate("members");
    res.status(200).json(groupMembers);
  } catch (error) {
    res.status(500).send("Internal server error");
  }
});

const sendGroupMessage = asyncHandler(async (req, res) => {
  try {
    const data = req.body.message;
    const groupId = req.params.id;
    const senderId = req.user._id;
    const image = "";

    const message = await groupMessageModel.create({
      senderId,
      groupId,
      text: data,
      image,
    });

    res.status(200).json(message);
  } catch (error) {
    console.log(error);

    res.status(500).send("Internal Server error");
  }
});
module.exports = {
  createGroup,
  getGroupsForUser,
  getGroupDetails,
  getGroupMemberList,
  sendGroupMessage,
};
