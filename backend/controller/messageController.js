const asyncHandler = require("express-async-handler");
const messageModel = require("../model/messageModel");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const uploadFile = require("../services/imagekit.service");

const getMessages = asyncHandler(async (req, res) => {
  try {
    const userToChatId = req.params.id;
    const logedInUserId = req.user._id;

    const messages = await messageModel.find({
      $or: [
        { senderId: logedInUserId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: logedInUserId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    res.status(400).send(error);
  }
});

const sendMessage = asyncHandler(async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const logedInUserId = req.user._id;
    const { text } = req.body;
    const files = req.files;

    if (files) {
      const newMessages = [];
      for (const file of files) {
        const fileType = file.mimetype.split("/")[0];
        if (fileType === "image") {
          const image = await uploadFile(file);
          const newMessage = await messageModel.create({
            senderId: logedInUserId,
            receiverId: userToChatId,
            image: image.url,
          });
          newMessages.push(newMessage);
        } else if (fileType === "video") {
          const video = await uploadFile(file);
          const newMessage = await messageModel.create({
            senderId: logedInUserId,
            receiverId: userToChatId,
            video: video.url,
          });
          newMessages.push(newMessage);
        } else if (fileType === "audio") {
          const audio = await uploadFile(file);
          const newMessage = await messageModel.create({
            senderId: logedInUserId,
            receiverId: userToChatId,
            audio: audio.url,
          });
          newMessages.push(newMessage);
        } else {
          const file = await uploadFile(file);
          const newMessage = await messageModel.create({
            senderId: logedInUserId,
            receiverId: userToChatId,
            file: file.url,
          });
          newMessages.push(newMessage);
        }
      }
      res.status(200).send(newMessages);
    } else {
      const newMessage = await messageModel.create({
        senderId: logedInUserId,
        receiverId: userToChatId,
        text,
      });
      res.status(200).send(newMessage);
    }

    // The socket functionality happens on the client-side now
  } catch (error) {
    res.status(400).send(error.message);
  }
});

module.exports = { getMessages, sendMessage };
