const asyncHandler = require("express-async-handler");
const groupChatModel = require("../model/groupChatModel");
const groupMessageModel = require("../model/groupMessageModel");
const cloudinary = require("cloudinary").v2;
const { io } = require("../index");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const uploadFile = require("../services/imagekit.service");

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
        },
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
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const userId = req.user._id;
    const groups = await groupChatModel
      .find({
        members: userId,
      })
      .populate("members", "name pic email")
      .populate("admin", "name pic email")
      .sort({ updatedAt: -1 });

    res.status(200).json(groups);
  } catch (error) {
    console.error("Failed to get user groups:", error);
    res.status(500).json({ message: "Failed to fetch groups" });
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
    const groupId = req.params.id;
    const senderId = req.user._id;
    const { text } = req.body;
    const files = req.files;
    console.log(text);
    if (files && files.length > 0) {
      const newMessages = [];
      for (const file of files) {
        const fileType = file.mimetype.split("/")[0];
        if (fileType === "image") {
          const image = await uploadFile(file);
          const newMessage = await groupMessageModel.create({
            senderId,
            groupId,
            image: image.url,
          });
          newMessages.push(newMessage);
        } else if (fileType === "video") {
          const video = await uploadFile(file);
          const newMessage = await groupMessageModel.create({
            senderId,
            groupId,
            video: video.url,
          });
          newMessages.push(newMessage);
        } else if (fileType === "audio") {
          const audio = await uploadFile(file);
          const newMessage = await groupMessageModel.create({
            senderId,
            groupId,
            audio: audio.url,
          });
          newMessages.push(newMessage);
        } else {
          const uploadedFile = await uploadFile(file);
          const newMessage = await groupMessageModel.create({
            senderId,
            groupId,
            file: uploadedFile.url,
          });
          newMessages.push(newMessage);
        }
      }
      res.status(200).send(newMessages);
    } else {
      const newMessage = await groupMessageModel.create({
        senderId,
        groupId,
        text,
      });
      res.status(200).send(newMessage);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server error");
  }
});

const getAllChatOfGroup = asyncHandler(async (req, res) => {
  try {
    const groupId = req.params.id;
    const messages = await groupMessageModel
      .find({ groupId })
      .populate("senderId");
    res.status(200).json(messages);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
});

const addNewMembersToGroup = asyncHandler(async (req, res) => {
  try {
    console.log("run");

    const groupId = req.body.groupId;
    const addList = req.body.addList; // array of user IDs to add

    const group = await groupChatModel.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Convert ObjectIds to strings for comparison
    const currentMembers = group.members.map((id) => id.toString());

    const newMembers = addList.filter(
      (userId) => !currentMembers.includes(userId),
    );

    if (!newMembers.length) {
      return res
        .status(400)
        .json({ message: "User(s) already present in group" });
    }

    group.members.push(...newMembers);

    await group.save();

    res.status(200).json({ message: "Members added successfully", group });
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to add in group");
  }
});

const removeMemberFromGroup = asyncHandler(async (req, res) => {
  try {
    const groupID = req.params.id;
    const removeUserId = req.body.removeUserId;
    const logedInUserID = req.user._id;
    if (removeUserId == logedInUserID) {
      return res.status(200).json({
        message: "You can only leave the group, not remove yourself.",
      });
    }
    const group = await groupChatModel.findById(groupID);
    if (group.admin.includes(logedInUserID)) {
      if (group.admin.includes(removeUserId)) {
        return res.status(200).json({
          message: "Group admin can't be removed, only leave the group.",
        });
      } else {
        await groupChatModel.findByIdAndUpdate(
          groupID,
          { $pull: { members: removeUserId } },
          { new: true },
        );
        return res
          .status(200)
          .json({ message: "You successfully removed the group member." });
      }
    } else {
      return res.status(200).json({ message: "Only admin can remove members" });
    }
  } catch (error) {
    return res.status(400).json("Failed to remove member");
  }
});
const makeAdminOfGroup = asyncHandler(async (req, res) => {
  try {
    const logedInUserId = req.user._id;
    const groupId = req.params.id;
    const personWhoBecameAdmin = req.body.id;
    const group = await groupChatModel.findById(groupId);

    if (group.admin.includes(logedInUserId)) {
      await groupChatModel.findByIdAndUpdate(
        groupId,
        { $addToSet: { admin: personWhoBecameAdmin } },
        { new: true },
      );

      return res
        .status(200)
        .json({ message: "User has been made admin successfully" });
    } else {
      return res
        .status(200)
        .json({ message: "Only admin can make any one admin" });
    }
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

const leaveGroup = asyncHandler(async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.user._id;
    const group = await groupChatModel.findById(groupId);
    if (group.admin.includes(userId) && group.admin.length == 1) {
      return res.status(200).json({
        message:
          "You can't leave as the only admin. Please assign another admin first.",
      });
    } else {
      if (group.admin.includes(userId)) {
        await groupChatModel.findByIdAndUpdate(
          groupId,
          { $pull: { admin: userId } },
          { new: true },
        );
      }
      await groupChatModel.findByIdAndUpdate(
        groupId,
        { $pull: { members: userId } },
        { new: true },
      );

      return res
        .status(200)
        .json({ message: "You successfully leave from the group." });
    }
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

const deleteGroupMessage = asyncHandler(async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const logedInUserId = req.user._id;

    // Find the message
    const message = await groupMessageModel.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Check if the logged-in user is the sender
    if (message.senderId.toString() !== logedInUserId.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this message" });
    }

    // Delete the message
    await groupMessageModel.findByIdAndDelete(messageId);

    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = {
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
  deleteGroupMessage,
};
