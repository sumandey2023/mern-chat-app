const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../model/userModel");

const isLoggedIn = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    req.user = await User.findById(decoded.id).select("-password");

    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "token not found" });
  }
});

module.exports = isLoggedIn;
