// const asyncHandler = require("express-async-handler");
// const messageModel = require("../model/messageModel");

// const getMessages = asyncHandler(async (req, res) => {
//   try {
//     const userToChatId = req.params.id;
//     const logedInUserId = req.user._id;

//     const messages = await messageModel.find({
//       $or: [
//         { senderId: logedInUserId, receiverId: userToChatId },
//         { senderId: userToChatId, receiverId: logedInUserId },
//       ],
//     });

//     res.status(200).json(messages);
//   } catch (error) {
//     res.status(400).send(error);
//   }
// });

// const sendMessage = asyncHandler(async (req, res) => {
//   try {
//     const { id: userToChatId } = req.params;
//     const logedInUserId = req.user._id;
//     const { text, image } = req.body;
//     let imageUrl;
//     if (image) {
//     }
//     const newMessage = await messageModel.create({
//       senderId: logedInUserId,
//       receiverId: userToChatId,
//       text,
//       image: imageUrl,
//     });
//     res.status(200).send(newMessage);
//   } catch (error) {
//     res.status(400).send(error.message);
//   }
// });

// module.exports = { getMessages, sendMessage };
//

const asyncHandler = require("express-async-handler");
const messageModel = require("../model/messageModel");

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
    const { text, image } = req.body;
    let imageUrl;

    if (image) {
      // Your image handling logic here
    }

    const newMessage = await messageModel.create({
      senderId: logedInUserId,
      receiverId: userToChatId,
      text,
      image: imageUrl,
    });

    // The socket functionality happens on the client-side now
    res.status(200).send(newMessage);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

module.exports = { getMessages, sendMessage };
