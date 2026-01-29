const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../model/userModel");

const isLoggedIn = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_KEY);
    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ message: "Authentication failed" });
  }
});

module.exports = isLoggedIn;
