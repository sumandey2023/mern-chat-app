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
    origin: [
      "https://adda-pi.vercel.app",
      "http://localhost:5173",
      "http://localhost:4173",
      "https://adda20-new.vercel.app",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

db();

const allowedOrigins = [
  "http://localhost:5173",
  "https://adda-pi.vercel.app",
  "http://localhost:4173",
  "https://adda20-new.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/user", upload.single("pic"), userRoutes);
app.use("/message", upload.array("files", 20), messageRoute);
app.use("/group", upload.array("files", 20), groupRoute);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something broke!" });
});

const onlineUsers = new Map();
const groupRooms = new Map();

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("addUser", (userId) => {
    onlineUsers.set(userId, socket.id);

    io.emit("getUsers", Array.from(onlineUsers.keys()));
    console.log(`User ${userId} is online with socket ID: ${socket.id}`);
  });

  socket.on("joinGroup", (groupId) => {
    socket.join(groupId);
    if (!groupRooms.has(groupId)) {
      groupRooms.set(groupId, new Set());
    }
    groupRooms.get(groupId).add(socket.id);
    console.log(`User ${socket.id} joined group ${groupId}`);
  });

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

  socket.on("sendGroupMessage", (data) => {
    io.to(data.groupId).emit("receiveGroupMessage", data);
  });

  socket.on("groupMemberUpdate", (data) => {
    io.to(data.groupId).emit("groupMemberUpdated", data);
  });

  socket.on("groupTyping", (data) => {
    socket.to(data.groupId).emit("groupUserTyping", {
      senderId: data.senderId,
      isTyping: data.isTyping,
    });
  });

  socket.on("sendMessage", (data) => {
    const receiverSocketId = onlineUsers.get(data.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receiveMessage", data);
    }
  });

  socket.on("typing", (data) => {
    const receiverSocketId = onlineUsers.get(data.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("userTyping", {
        senderId: data.senderId,
        isTyping: data.isTyping,
      });
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);

    for (const [userId, sid] of onlineUsers.entries()) {
      if (sid === socket.id) {
        onlineUsers.delete(userId);

        io.emit("getUsers", Array.from(onlineUsers.keys()));
        break;
      }
    }

    for (const [groupId, sockets] of groupRooms.entries()) {
      sockets.delete(socket.id);
      if (sockets.size === 0) {
        groupRooms.delete(groupId);
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
