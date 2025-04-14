// const express = require("express");
// const dotenv = require("dotenv");
// const cors = require("cors");
// const db = require("./config/connectDB");
// const cookieParser = require("cookie-parser");
// const userRoutes = require("./Routes/userRoute");
// const app = express();
// const PORT = process.env.PORT || 5000;

// dotenv.config();
// db();

// app.use(cors());

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());

// app.use("/user", userRoutes);

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ message: "Something broke!" });
// });

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const db = require("./config/connectDB");
const cookieParser = require("cookie-parser");
const userRoutes = require("./Routes/userRoute");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

db();

// ✅ Enable CORS with credentials
app.use(
  cors({
    origin: "http://localhost:5173", // frontend URL
    credentials: true, // allow cookies
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/user", upload.single("pic"), userRoutes);
// app.get("/test", (req, res) => {
//   const token = req.cookies.token; // get the 'token' cookie
//   console.log("Token:", token);
//   res.send(`Token is: ${token}`);
// });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something broke!" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
