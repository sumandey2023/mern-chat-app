import React, { useState, useEffect } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import TelegramIcon from "@mui/icons-material/Telegram";
import { IconButton } from "@mui/material";
import { useMediaQuery } from "react-responsive";
import { useSelector } from "react-redux";
import axios from "axios";
import Lottie from "lottie-react";
import MessageSelf from "./MessageSelf";
import MessageOther from "./MessageOther";
import api from "../../config/axios";

const AIChat = () => {
  const [userData, setUserData] = useState({});
  const isSmallScreen = useMediaQuery({ maxWidth: 1150 });
  const lightTheme = useSelector((state) => state.themeKey);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [typingData, setTypingData] = useState(null);

  useEffect(() => {
    fetch("/typing.json")
      .then((res) => res.json())
      .then((data) => setTypingData(data));
  }, []);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data } = await api.get("/user/get-user-details", {
          withCredentials: true,
        });
        setUserData(data);
      } catch (error) {
        console.log(error);
      }
    };
    getUser();
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const { data } = await api.post(
        "/user/ai",
        { prompt: input },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      const aiMsg = {
        text: data.response || "No response from AI.",
        sender: "ai",
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error("AI API error:", error);
      setMessages((prev) => [
        ...prev,
        { text: "Failed to fetch AI response.", sender: "ai" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return (
    <div
      className={`grow py-4 px-3 h-full ${
        lightTheme ? "bg-gray-100" : "bg-[#181C14]"
      }`}
    >
      <div
        className={`flex flex-col h-full rounded-2xl shadow-md overflow-hidden ${
          lightTheme ? "bg-white" : "bg-[#3C3D37]"
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center px-4 py-3 ${
            lightTheme ? "bg-gray-50" : "bg-[#2A2D27]"
          }`}
        >
          <div
            className={`w-[40px] h-[40px] lg:w-[50px] lg:h-[50px] rounded-full flex justify-center items-center text-white text-xl lg:text-2xl font-bold ${
              lightTheme ? "bg-gray-400" : "bg-gray-600"
            }`}
          >
            AI
          </div>
          <h1
            className={`text-base lg:text-lg font-semibold flex-grow ml-3 ${
              lightTheme ? "text-gray-800" : "text-white"
            }`}
          >
            Adda AI
          </h1>
          <DeleteIcon
            onClick={clearMessages}
            className={`cursor-pointer transition ${
              lightTheme
                ? "text-gray-500 hover:text-red-500"
                : "text-gray-400 hover:text-red-400"
            }`}
          />
        </div>

        {/* Messages */}
        <div className="flex-1 p-2 lg:p-4 overflow-y-auto no-scrollbar flex flex-col gap-2">
          <MessageOther
            text={`Hii ${userData.user?.name} tell me how i can help you`}
            avatar={"AI"}
          />
          {messages.map((msg, index) =>
            msg.sender === "user" ? (
              <MessageSelf key={index} text={msg.text} />
            ) : (
              <MessageOther key={index} text={msg.text} avatar={"AI"} />
            )
          )}

          {/* Typing Animation */}
          {loading && typingData && (
            <div className="flex justify-start">
              <div className="max-w-[60%] px-3 py-2 rounded-2xl ">
                <Lottie animationData={typingData} className="w-24" loop />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`p-2 lg:p-3 flex items-center rounded-b-2xl ${
            lightTheme ? "bg-gray-100" : "bg-[#2A2D27]"
          }`}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className={`flex-1 p-2 rounded-full outline-none text-base lg:text-lg ${
              lightTheme ? "bg-white" : "bg-[#3C3D37] text-white"
            }`}
          />

          <IconButton
            size={isSmallScreen ? "small" : "medium"}
            onClick={sendMessage}
          >
            <TelegramIcon
              className={lightTheme ? "text-blue-500" : "text-blue-400"}
            />
          </IconButton>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
