const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  const token = jwt.sign(
    { email: user.email, id: user._id },
    process.env.JWT_KEY,
    { expiresIn: "30d" }
  );
  return token;
};

module.exports = generateToken;
