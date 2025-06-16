const userModel = require("../model/userModel");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const cloudinary = require("cloudinary").v2;

const generateToken = require("../util/generateToken");
const jwt = require("jsonwebtoken");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Login controller
const loginController = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide both email and password" });
  }

  const user = await userModel.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "Email or Password is incorrect" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Email or Password is incorrect" });
  }

  const token = generateToken(user);

  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000,
    path: "/",
  });

  return res.status(200).json({
    message: "Login successful",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
    },
    token,
  });
});

// Signup controller
// const signupController = asyncHandler(async (req, res) => {
//   const { name, email, username, password, pic } = req.body;
//   console.log(pic);

//   const usernameExist = await userModel.findOne({ username });
//   const emailExist = await userModel.findOne({ email });

//   if (usernameExist)
//     return res.status(400).json({ message: "Username already exists" });
//   if (emailExist)
//     return res.status(400).json({ message: "Email already exists" });

//   const salt = await bcrypt.genSalt(10);
//   const hash = await bcrypt.hash(password, salt);
//   let newUser;

//   try {
//     const buffer = req.file.buffer.toString("base64");
//     const result = await cloudinary.uploader.upload(
//       `data:${req.file.mimetype};base64,${buffer}`,
//       {
//         public_id: username || undefined,
//       }
//     );
//     console.log(req.body);

//     console.log(name, email, username, pic);

//     newUser = await userModel.create({
//       name,
//       email,
//       username,
//       password: hash,
//       pic: result.secure_url,
//     });
//   } catch (error) {
//     newUser = await userModel.create({
//       name,
//       email,
//       username,
//       password: hash,
//     });
//   }

//   const token = generateToken(newUser);

//   res.cookie("token", token, {
//     httpOnly: true,
//     secure: false,
//     sameSite: "lax",
//     maxAge: 24 * 60 * 60 * 1000,
//   });

//   return res.status(201).json({
//     message: "User registered successfully",
//     user: {
//       id: newUser._id,
//       name: newUser.name,
//       email: newUser.email,
//       username: newUser.username,
//     },
//     token,
//   });
// });

const signupController = asyncHandler(async (req, res) => {
  const { name, email, username, password } = req.body;

  // Validate required fields
  if (!name || !email || !username || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const usernameExist = await userModel.findOne({ username });
  const emailExist = await userModel.findOne({ email });

  if (usernameExist)
    return res.status(400).json({ message: "Username already exists" });
  if (emailExist)
    return res.status(400).json({ message: "Email already exists" });

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  let picUrl;
  console.log("File: ", req.file);

  if (req.file) {
    try {
      const buffer = req.file.buffer.toString("base64");
      const result = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${buffer}`,
        { public_id: username }
      );
      picUrl = result.secure_url;
    } catch (error) {
      console.error("Cloudinary upload failed", error);
      return res.status(500).json({ message: "Image upload failed" });
    }
  }
  console.log(picUrl);

  const newUser = await userModel.create({
    name,
    email,
    username,
    password: hash,
    pic: picUrl, // can be undefined, that's okay
  });

  const token = generateToken(newUser);

  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000,
    path: "/",
  });

  return res.status(201).json({
    message: "User registered successfully",
    user: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      username: newUser.username,
    },
    token,
  });
});

// Logout controller
const logOutController = asyncHandler(async (req, res) => {
  // First, clear the cookie using clearCookie
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });

  // Then set an expired cookie as a backup method
  res.cookie("token", "", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: -1,
    expires: new Date(0),
    path: "/",
  });

  // Remove from localStorage on client side
  return res.status(201).json({
    message: "Logged out successfully",
    clearLocalStorage: true,
  });
});

const fetchAllUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await userModel
    .find(keyword)
    .find({
      _id: { $ne: req.user._id },
    })
    .select("-password");

  res.send(users);
});

const getUserDetails = asyncHandler(async (req, res) => {
  const token = req.cookies.token;
  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const email = decoded.email;
    const user = await userModel.findOne({ email });

    return res.status(200).json({ user });
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Something went wrong" });
  }
});

const searchUsers = asyncHandler(async (req, res) => {
  const token = req.cookies.token;

  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const currentUserId = decoded.id;

    const search = req.query.search || "";

    const users = await userModel
      .find({
        _id: { $ne: currentUserId }, // Exclude logged-in user
        $or: [
          { name: { $regex: `^${search}`, $options: "i" } },
          { username: { $regex: `^${search}`, $options: "i" } },
        ], // Search by name starting with input (case-insensitive)
      })
      .select("-password"); // Don't send password

    res.json(users);
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
});

const getChatUser = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await userModel.findById(userId).select("-password");
    res.json(user);
  } catch (error) {
    console.log(error);
  }
});

// const addToChatList = asyncHandler(async (req, res) => {
//   try {
//     const { userId } = req.body;
//     const logedInUserId = req.user._id;

//     // Validate input
//     if (!userId || !logedInUserId) {
//       return res.status(400).json({ message: "Invalid user IDs" });
//     }

//     const loggedInUser = await userModel.findById(logedInUserId);
//     const userToAdd = await userModel.findById(userId);

//     if (!loggedInUser || !userToAdd) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Check if the user is already in the chat list
//     if (!loggedInUser.chatlist.includes(userId)) {
//       loggedInUser.chatlist.push(userId);
//       await loggedInUser.save();
//     }

//     // Check if the logged-in user is already in the other user's chat list
//     if (!userToAdd.chatlist.includes(logedInUserId)) {
//       userToAdd.chatlist.push(logedInUserId);
//       await userToAdd.save();
//     }

//     res.status(200).json({ message: "User added to chat list" });
//   } catch (error) {
//     console.error("Error in addToChatList:", error.message);
//     res.status(500).json({ message: "Error adding user to chat list" });
//   }
// });

const addToChatList = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.body;
    const logedInUserId = req.user._id;

    if (!userId || !logedInUserId) {
      return res.status(400).json({ message: "Invalid user IDs" });
    }

    const loggedInUser = await userModel.findById(logedInUserId);
    const userToAdd = await userModel.findById(userId);

    if (!loggedInUser || !userToAdd) {
      return res.status(404).json({ message: "User not found" });
    }

    await userModel.findByIdAndUpdate(logedInUserId, {
      $addToSet: { chatlist: userId },
    });

    await userModel.findByIdAndUpdate(userId, {
      $addToSet: { chatlist: logedInUserId },
    });

    res.status(200).json({ message: "User added to chat list" });
  } catch (error) {
    console.error("Error in addToChatList:", error.message);
    res.status(500).json({ message: "Error adding user to chat list" });
  }
});

const chatlist = asyncHandler(async (req, res) => {
  try {
    const logedInUserId = req.user._id;

    const userData = await userModel
      .findById(logedInUserId)
      .populate("chatlist")
      .select("-password");
    const chatList = userData.chatlist.reverse();

    res.status(200).send(chatList);
  } catch (error) {
    res.status(400).json({ message: "Error fetching chat list" });
  }
});

const updateUserDetails = asyncHandler(async (req, res) => {
  const { name } = req.body;
  // if (!req.file) {
  //   return res.status(400).json({ message: "Select a new image or name" });
  // }
  let picUrl;
  console.log(req.file);
  if (req.file) {
    try {
      const buffer = req.file.buffer.toString("base64");
      const result = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${buffer}`,
        { public_id: name + Math.random() }
      );
      picUrl = result.secure_url;
    } catch (error) {
      console.error("Cloudinary upload failed", error);
      return res.status(500).json({ message: "Image upload failed" });
    }
  }
  const user = await userModel.findByIdAndUpdate(
    req.user._id,
    {
      name: name,
      pic: picUrl,
    },
    { new: true }
  );
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  return res.status(200).json({
    message: "User updated successfully",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      pic: user.pic,
    },
  });
});

module.exports = {
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
};
