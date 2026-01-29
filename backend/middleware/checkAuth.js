const express = require("express");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const checkAuth = asyncHandler((req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "You must log in or sing up" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    return res.status(200).json({ success: true, user: decoded });
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Something went wrong" });
  }
});

module.exports = checkAuth;
