const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const db = require("./config/connectDB");
const cookieParser = require("cookie-parser");
const userRoutes = require("./Routes/userRoute");
const messageRoute = require("./Routes/messageRoute");
const groupRoute = require("./Routes/groupRoute");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const http = require("http");
const { Server } = require("socket.io");
// const BASE_URL = "http://localhost:5173";
const BASE_URL = "https://adda-pi.vercel.app";
dotenv.config();
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

const io = new Server(server, {
  cors: {
    origin: BASE_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

db();

// CORS configuration
const allowedOrigins = ["http://localhost:3000", "https://adda-pi.vercel.app"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Preflight support

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/user", upload.single("pic"), userRoutes);
app.use("/message", upload.single("pic"), messageRoute);
app.use("/group", groupRoute);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something broke!" });
});

const onlineUsers = new Map();
const groupRooms = new Map();

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // When a user connects, they should emit their userId
  socket.on("addUser", (userId) => {
    onlineUsers.set(userId, socket.id);
    // Broadcast to all clients that a user is online
    io.emit("getUsers", Array.from(onlineUsers.keys()));
    console.log(`User ${userId} is online with socket ID: ${socket.id}`);
  });

  // Join group room
  socket.on("joinGroup", (groupId) => {
    socket.join(groupId);
    if (!groupRooms.has(groupId)) {
      groupRooms.set(groupId, new Set());
    }
    groupRooms.get(groupId).add(socket.id);
    console.log(`User ${socket.id} joined group ${groupId}`);
  });

  // Leave group room
  socket.on("leaveGroup", (groupId) => {
    socket.leave(groupId);
    if (groupRooms.has(groupId)) {
      groupRooms.get(groupId).delete(socket.id);
      if (groupRooms.get(groupId).size === 0) {
        groupRooms.delete(groupId);
      }
    }
    console.log(`User ${socket.id} left group ${groupId}`);
  });

  // Handle sending messages to group
  socket.on("sendGroupMessage", (data) => {
    io.to(data.groupId).emit("receiveGroupMessage", data);
  });

  // Handle group member updates
  socket.on("groupMemberUpdate", (data) => {
    io.to(data.groupId).emit("groupMemberUpdated", data);
  });

  // Handle typing indicator in group
  socket.on("groupTyping", (data) => {
    socket.to(data.groupId).emit("groupUserTyping", {
      senderId: data.senderId,
      isTyping: data.isTyping,
    });
  });

  // Handle sending messages to individual users
  socket.on("sendMessage", (data) => {
    const receiverSocketId = onlineUsers.get(data.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receiveMessage", data);
    }
  });

  // Handle typing indicator for individual chats
  socket.on("typing", (data) => {
    const receiverSocketId = onlineUsers.get(data.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("userTyping", {
        senderId: data.senderId,
        isTyping: data.isTyping,
      });
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    // Find and remove the user from onlineUsers
    for (const [userId, sid] of onlineUsers.entries()) {
      if (sid === socket.id) {
        onlineUsers.delete(userId);
        // Broadcast to all clients that a user is offline
        io.emit("getUsers", Array.from(onlineUsers.keys()));
        break;
      }
    }
    // Clean up group rooms
    for (const [groupId, sockets] of groupRooms.entries()) {
      sockets.delete(socket.id);
      if (sockets.size === 0) {
        groupRooms.delete(groupId);
      }
    }
  });
});

// Use server.listen instead of app.listen to enable Socket.io
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
