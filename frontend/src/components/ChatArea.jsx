import React, { useEffect, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import MessageOther from "./MessageOther";
import MessageSelf from "./MessageSelf";
import MicIcon from "@mui/icons-material/Mic";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import TelegramIcon from "@mui/icons-material/Telegram";
import { Avatar, IconButton } from "@mui/material";
import { useMediaQuery } from "react-responsive";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import api from "../../config/axios";
import axios from "axios";
const ChatArea = () => {
  const isSmallScreen = useMediaQuery({ maxWidth: 1150 });
  const lightTheam = useSelector((state) => state.themeKey);
  const [receiverData, setreceiverData] = useState([]);
  const { id } = useParams();

  useEffect(() => {
    const fetchReceiverData = async () => {
      try {
        const data = await api.get(`/user/get-chat-user/${id}`, {
          credentials: "include", // This will include cookies in the request
          headers: {
            "Content-Type": "application/json",
          },
        });

        const receivedData = data.data;
        setreceiverData(receivedData);
      } catch (error) {
        console.log(error);
      }
    };
    fetchReceiverData();
  }, [id]);

  return (
    <div
      className={`grow py-4 px-3 h-full ${
        lightTheam ? "bg-gray-100" : "bg-[#181C14]"
      }`}
    >
      <div
        className={`flex flex-col h-full rounded-2xl shadow-lg overflow-hidden ${
          lightTheam ? "bg-white" : "bg-[#3C3D37]"
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center px-4 py-3 border-b ${
            lightTheam
              ? "bg-gray-50 border-gray-200"
              : "bg-[#2A2D27] border-gray-700"
          }`}
        >
          <Avatar
            alt="Profile"
            src={receiverData?.pic}
            sx={{
              width: 65,
              height: 65,
              border: `2px solid white`,
            }}
          />
          <h1
            className={`text-base lg:text-lg font-semibold flex-grow ml-3 ${
              lightTheam ? "text-gray-800" : "text-white"
            }`}
          >
            {receiverData.name}
          </h1>
          <DeleteIcon
            className={`cursor-pointer transition-all duration-300 hover:scale-110 ${
              lightTheam
                ? "text-gray-500 hover:text-red-500"
                : "text-gray-400 hover:text-red-400"
            }`}
          />
        </div>

        {/* Chat Messages (Middle Section) */}
        <div
          className={`flex-1 p-2 lg:p-4 overflow-y-auto no-scrollbar bg-gradient-to-b from-gray-50 to-white ${
            lightTheam ? "" : "dark:from-[#2A2D27] dark:to-[#3C3D37]"
          }`}
        >
          <MessageOther text="Hello, how are you?" />
          <MessageSelf text="I'm good! What about you?" />
          <MessageOther text="I'm doing great! Thanks for asking." />
          <MessageSelf text="Glad to hear that!" />
          <MessageOther text="I'm doing great! Thanks for asking." />
          <MessageSelf text="Glad to hear that!" />
          <MessageOther text="Hello, how are you?" />
          <MessageSelf text="I'm good! What about you?" />
          <MessageOther text="Hello, how are you?" />
          <MessageSelf text="I'm good! What about you?" />
          <MessageOther text="Hello, how are you?" />
          <MessageSelf text="I'm good! What about you?" />
          <MessageOther text="😀 " />
          <MessageSelf text="😘😘😘😘😘😘😘😘😘😘😘😘" />
        </div>

        {/* Footer */}
        <div
          className={`p-2 lg:p-3 flex items-center rounded-b-2xl border-t ${
            lightTheam
              ? "bg-gray-100 border-gray-200"
              : "bg-[#2A2D27] border-gray-700"
          }`}
        >
          <input
            type="text"
            placeholder="Type a message..."
            className={`flex-1 p-2 rounded-full outline-none text-base lg:text-lg shadow-sm transition-all duration-300 focus:shadow-md ${
              lightTheam ? "bg-white" : "bg-[#3C3D37] text-white"
            }`}
          />

          <IconButton
            size={isSmallScreen ? "small" : "medium"}
            className="hover:scale-110 transition-transform duration-300"
          >
            <AttachFileIcon
              className={lightTheam ? "text-gray-600" : "text-gray-300"}
            />
          </IconButton>
          <IconButton
            size={isSmallScreen ? "small" : "medium"}
            className="hover:scale-110 transition-transform duration-300"
          >
            <MicIcon
              className={lightTheam ? "text-gray-600" : "text-gray-300"}
            />
          </IconButton>
          <IconButton
            size={isSmallScreen ? "small" : "medium"}
            className="hover:scale-110 transition-transform duration-300"
          >
            <TelegramIcon
              className={lightTheam ? "text-blue-500" : "text-blue-400"}
            />
          </IconButton>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
