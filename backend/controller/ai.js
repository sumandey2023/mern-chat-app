const asyncHandler = require("express-async-handler");
// const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleGenAI } = require("@google/genai");
const genAI = new GoogleGenAI({});
// const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const ai = asyncHandler(async (req, res) => {
  try {
    const { prompt } = req.body;
    const result = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });
    const text = result.text;
    return res.status(200).json({ response: text });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "Error processing AI response." });
  }
});

module.exports = { ai };
