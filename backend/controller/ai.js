const asyncHandler = require("express-async-handler");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI({});
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const ai = asyncHandler(async (req, res) => {
  try {
    const { prompt } = req.body;
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return res.status(200).json({ response: text });
  } catch (error) {
    return res.status(400).json({ message: "Error processing AI response." });
  }
});

module.exports = { ai };
