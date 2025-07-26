var ImageKit = require("imagekit");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
dotenv.config();

var imagekit = new ImageKit({
  publicKey: process.env.PUBLIC_KEY,
  privateKey: process.env.PRIVATE_KEY,
  urlEndpoint: process.env.URL_END_POINT,
});

const uploadFile = (file) => {
  return new Promise((resolve, reject) => {
    imagekit.upload(
      {
        file: file.buffer, // Convert buffer to base64 string
        fileName: file.originalname + new mongoose.Types.ObjectId().toString(),
        folder: "adda_files",
      },
      (error, result) => {
        if (error) {
          console.error("Error uploading file:", error);
          reject(error);
        } else {
          // console.log("File uploaded successfully:", result);
          resolve(result);
        }
      }
    );
  });
};

module.exports = uploadFile;
