import React, { useState, useEffect, useRef } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import TelegramIcon from "@mui/icons-material/Telegram";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { IconButton, Tooltip, Fade } from "@mui/material";
import { useMediaQuery } from "react-responsive";
import { useSelector } from "react-redux";
import Lottie from "lottie-react";
import MessageSelf from "./MessageSelf";
import MessageOther from "./MessageOther";
import api from "../config/api";

const AIChat = () => {
  const [userData, setUserData] = useState({});
  const isSmallScreen = useMediaQuery({ maxWidth: 1150 });
  const lightTheme = useSelector((state) => state.themeKey);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [typingData, setTypingData] = useState(null);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

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

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div
      className={`grow py-4 px-3 h-full ${
        lightTheme ? "bg-gray-100" : "bg-[#181C14]"
      }`}
      onClick={focusInput}
    >
      <div
        className={`flex flex-col h-full rounded-2xl shadow-xl overflow-hidden ${
          lightTheme ? "bg-white" : "bg-[#3C3D37]"
        } transition-all duration-300`}
      >
        {/* Enhanced Header */}
        <div
          className={`flex items-center px-5 py-4  ${
            lightTheme
              ? "bg-white border-b border-gray-200"
              : "bg-[#2A2D27] border-b border-gray-700"
          }`}
        >
          <div
            className={`w-[45px] h-[45px] lg:w-[50px] lg:h-[50px] rounded-full flex justify-center items-center text-white text-xl lg:text-2xl font-bold ${
              lightTheme ? "bg-blue-500" : "bg-blue-700"
            } shadow-md`}
          >
            <SmartToyIcon />
          </div>
          <div className="ml-3 flex-grow">
            <h1
              className={`text-lg lg:text-xl font-semibold ${
                lightTheme ? "" : "text-white"
              }`}
            >
              Adda AI Assistant
            </h1>
            <div
              className={`text-xs lg:text-sm opacity-80 ${
                lightTheme ? "text-gray-600" : "text-gray-200"
              }`}
            >
              {loading ? "Typing..." : "Online"}
            </div>
          </div>
          <Tooltip title="Clear conversation" placement="top">
            <IconButton
              onClick={clearMessages}
              className={`hover:bg-white/10 transition`}
              size={isSmallScreen ? "small" : "medium"}
            >
              <DeleteIcon
                className={
                  lightTheme
                    ? "text-gray-500 hover:text-red-400 "
                    : "text-white hover:text-red-400"
                }
              />
            </IconButton>
          </Tooltip>
        </div>

        {/* Messages Area with Improved Styling */}
        <div
          className={`flex-1 p-3 lg:p-5 overflow-y-auto no-scrollbar flex flex-col gap-3 ${
            lightTheme ? "bg-gray-50" : "bg-[#313130]"
          }`}
        >
          {/* Welcome Message */}
          <div className="text-center mb-2">
            <div
              className={`text-xs inline-block py-1 px-3 rounded-full ${
                lightTheme
                  ? "bg-gray-200 text-gray-600"
                  : "bg-gray-700 text-gray-300"
              }`}
            >
              Today
            </div>
          </div>

          <MessageOther
            text={`Hi ${
              userData.user?.name || "there"
            }! How can I assist you today?`}
            avatar={"AI"}
          />

          {messages.map((msg, index) =>
            msg.sender === "user" ? (
              <MessageSelf key={index} text={msg.text} />
            ) : (
              <MessageOther key={index} text={msg.text} avatar={"AI"} />
            )
          )}

          {/* Improved Typing Animation */}
          {loading && typingData && (
            <div className="flex justify-start">
              <div className={`max-w-[60%] px-3 py-2 rounded-2xl `}>
                <Lottie animationData={typingData} className="w-16" loop />
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Enhanced Footer */}
        <div
          className={`p-3 lg:p-4 flex items-center gap-2 ${
            lightTheme
              ? "bg-white border-t border-gray-200"
              : "bg-[#2A2D27] border-t border-gray-700"
          }`}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className={`flex-1 p-3 rounded-full outline-none text-base lg:text-lg transition-all ${
              lightTheme
                ? "bg-gray-100 text-gray-800 focus:bg-gray-200 focus:shadow-inner"
                : "bg-[#3C3D37] text-white focus:bg-[#444440] focus:shadow-inner"
            }`}
          />

          <Tooltip title="Send message" placement="top">
            <IconButton
              size={isSmallScreen ? "small" : "medium"}
              onClick={sendMessage}
              // disabled={!input.trim()}
              className={`${!input.trim() ? "opacity-60" : ""} ${
                lightTheme
                  ? "bg-blue-500 hover:bg-blue-600 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              <TelegramIcon
                className={lightTheme ? "text-gray-600" : "text-gray-300"}
                fontSize={isSmallScreen ? "small" : "medium"}
              />
            </IconButton>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
