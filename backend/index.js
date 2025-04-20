const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const db = require("./config/connectDB");
const cookieParser = require("cookie-parser");
const userRoutes = require("./Routes/userRoute");
const messageRoute = require("./Routes/messageRoute");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const http = require("http");
const { Server } = require("socket.io");
const BASE_URL = "http://localhost:5173";

dotenv.config();
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Initialize Socket.io with CORS configuration
const io = new Server(server, {
  cors: {
    origin: `${BASE_URL}`, // frontend URL
    methods: ["GET", "POST"],
    credentials: true,
  },
});

db();

// ✅ Enable CORS with credentials
app.use(
  cors({
    origin: `${BASE_URL}`, // frontend URL
    credentials: true, // allow cookies
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/user", upload.single("pic"), userRoutes);
app.use("/message", upload.single("pic"), messageRoute);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something broke!" });
});

const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("addUser", (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit("getUsers", Array.from(onlineUsers.keys()));
    console.log(`User ${userId} is online with socket ID: ${socket.id}`);
  });

  // Handle sending messages
  socket.on("sendMessage", (data) => {
    const receiverSocketId = onlineUsers.get(data.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receiveMessage", data);
    }
  });

  // Handle typing indicator
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
    for (const [userId, sid] of onlineUsers.entries()) {
      if (sid === socket.id) {
        onlineUsers.delete(userId);
        io.emit("getUsers", Array.from(onlineUsers.keys()));
        break;
      }
    }
  });
});

// Use server.listen instead of app.listen to enable Socket.io
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
