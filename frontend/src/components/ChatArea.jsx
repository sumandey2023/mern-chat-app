import React, { useEffect, useRef, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import MessageOther from "./MessageOther";
import MessageSelf from "./MessageSelf";
import MicIcon from "@mui/icons-material/Mic";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import TelegramIcon from "@mui/icons-material/Telegram";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import { Avatar, IconButton, Tooltip } from "@mui/material";
import { useMediaQuery } from "react-responsive";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import api from "../../config/axios";

const ChatArea = () => {
  const isSmallScreen = useMediaQuery({ maxWidth: 1150 });
  const lightTheme = useSelector((state) => state.themeKey);
  const [receiverData, setReceiverData] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState({});
  const [messageToBeSend, setMessageToBeSend] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchReceiverData = async () => {
      try {
        const data = await api.get(`/user/get-chat-user/${id}`, {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const receivedData = data.data;
        setReceiverData(receivedData);
      } catch (error) {
        console.log(error);
      }
    };

    fetchReceiverData();
  }, [id]);

  useEffect(() => {
    const getLoggedInUser = async () => {
      try {
        const { data } = await api.get("/user/get-user-details", {
          withCredentials: true,
        });
        setLoggedInUser(data.user);
      } catch (error) {
        console.log(error);
      }
    };
    getLoggedInUser();
  }, []);

  useEffect(() => {
    const fetchChat = async () => {
      try {
        const res = await api.get(`/message/${id}`, {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        });

        setMessages(res.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchChat();
  }, [id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageToBeSend.trim()) return;

    try {
      const { data } = await api.post(
        `/message/send/${id}`,
        {
          text: messageToBeSend,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      setMessages((prev) => [...prev, data]);
      setMessageToBeSend("");
      setTimeout(() => {
        const chatContainer = document.querySelector(".chat-container");
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
      }, 100);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleTyping = (e) => {
    setMessageToBeSend(e.target.value);
    setIsTyping(e.target.value.length > 0);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={`grow py-4 px-3 h-full transition-colors duration-300 ${
        lightTheme ? "bg-gray-100" : "bg-[#181C14]"
      } transition-all duration-300`}
    >
      <div
        className={`flex flex-col h-full rounded-2xl shadow-lg overflow-hidden transition-colors duration-300 ${
          lightTheme ? "bg-white" : "bg-[#3C3D37]"
        }transition-all duration-300 `}
      >
        {/* Header */}
        <div
          className={`flex items-center px-4 py-3 border-b transition-colors duration-300 ${
            lightTheme
              ? "bg-white border-gray-200"
              : "bg-[#2A2D27] border-gray-700"
          } transition-all duration-300`}
        >
          <div className="relative">
            <Avatar
              alt={receiverData?.name || "User"}
              src={receiverData?.pic}
              sx={{
                width: 50,
                height: 50,
                border: `2px solid ${
                  lightTheme ? "#e5e7eb" : "#4b5563"
                } transition-all duration-300`,
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
            />
            <span
              className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-green-400 border-2 ${
                lightTheme ? "border-white" : "border-[#2A2D27]"
              } transition-all duration-300`}
            ></span>
          </div>

          <div className="ml-3 flex-grow">
            <h1
              className={`text-base lg:text-lg font-semibold ${
                lightTheme ? "text-gray-800" : "text-white"
              } transition-all duration-300`}
            >
              {receiverData.name || "Loading..."}
            </h1>
            <p
              className={`text-xs ${
                lightTheme ? "text-green-600" : "text-green-400"
              } transition-all duration-300`}
            >
              Online
            </p>
          </div>
        </div>

        {/* Chat Messages Area with Fixed Scrollbar */}
        <div
          className={`flex-1 p-3 lg:p-4 overflow-y-auto  chat-container scroll-smooth no-scrollbar ${
            lightTheme
              ? "bg-gray-50 "
              : "bg-gradient-to-b from-[#2A2D27] to-[#323329] "
          } transition-all duration-300`}
          style={{
            overflowY: "auto",
            // scrollbarWidth: "thin",
            // scrollbarColor: lightTheme ? "#d1d5db #f3f4f6" : "#4b5563 #1f2937",
          }}
        >
          {messages.map((item, index) => {
            const time = formatDate(item.createdAt);
            return item.senderId === loggedInUser._id ? (
              <MessageSelf key={index} text={item.text} time={time} />
            ) : (
              <MessageOther
                key={index}
                text={item.text}
                pic={receiverData?.pic}
                time={time}
              />
            );
          })}

          <div ref={scrollRef} />
        </div>

        {/* Properly Aligned Footer with Input and Buttons */}
        <div
          className={`px-3 py-2 border-t transition-colors duration-300 ${
            lightTheme
              ? "bg-white border-gray-200"
              : "bg-[#2A2D27] border-gray-700"
          } transition-all duration-300`}
        >
          <div className="flex items-center gap-2">
            <Tooltip title="Attach File">
              <IconButton
                size="small"
                className={`flex-shrink-0 hover:scale-110 transition-transform duration-300 ${
                  lightTheme ? "hover:bg-gray-100" : "hover:bg-[#3C3D37]"
                } transition-all duration-300`}
              >
                <AttachFileIcon
                  className={lightTheme ? "text-gray-600" : "text-gray-300"}
                  fontSize="small"
                />
              </IconButton>
            </Tooltip>

            <Tooltip title="Emojis">
              <IconButton
                size="small"
                className={`flex-shrink-0 hover:scale-110 transition-transform duration-300 ${
                  lightTheme ? "hover:bg-gray-100" : "hover:bg-[#3C3D37]"
                }`}
              >
                <EmojiEmotionsIcon
                  className={lightTheme ? "text-gray-600" : "text-gray-300"}
                  fontSize="small"
                />
              </IconButton>
            </Tooltip>

            <div className="relative flex-1">
              {/* <input
                ref={inputRef}
                type="text"
                placeholder="Type a message..."
                className={`w-full py-2 px-4 rounded-full outline-none text-sm lg:text-base transition-all duration-300 ${
                  lightTheme
                    ? "bg-gray-100 text-gray-800 focus:ring-2 focus:ring-blue-200"
                    : "bg-[#3C3D37] text-white focus:ring-2 focus:ring-blue-700"
                }`}
                value={messageToBeSend}
                onChange={handleTyping}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              /> */}
              <input
                ref={inputRef}
                type="text"
                value={messageToBeSend}
                onChange={handleTyping}
                placeholder="Type a message..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className={`flex-1 w-full p-3 rounded-full outline-none text-base lg:text-lg transition-all ${
                  lightTheme
                    ? "bg-gray-100 text-gray-800 focus:bg-gray-200 focus:shadow-inner"
                    : "bg-[#3C3D37] text-white focus:bg-[#444440] focus:shadow-inner"
                } transition-all duration-300`}
              />
            </div>

            <Tooltip title="Voice Message">
              <IconButton
                size="small"
                className={`flex-shrink-0 hover:scale-110 transition-transform duration-300 ${
                  lightTheme ? "hover:bg-gray-100" : "hover:bg-[#3C3D37]"
                } transition-all duration-300`}
              >
                <MicIcon
                  className={lightTheme ? "text-gray-600" : "text-gray-300"}
                  fontSize="small"
                />
              </IconButton>
            </Tooltip>

            {/* <Tooltip title="Send">
              <IconButton
                size="small"
                className={`flex-shrink-0 hover:scale-110 transition-transform duration-300 ${
                  isTyping
                    ? lightTheme
                      ? "bg-blue-500 hover:bg-blue-600 text-white"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                    : lightTheme
                    ? "bg-gray-200"
                    : "bg-gray-700"
                }`}
                onClick={handleSendMessage}
                disabled={!isTyping}
              >
                <TelegramIcon
                  className={
                    isTyping
                      ? "text-white"
                      : lightTheme
                      ? "text-gray-600"
                      : "text-gray-300"
                  }
                  fontSize="small"
                />
              </IconButton>
            </Tooltip> */}
            <Tooltip title="Send message" placement="top">
              <IconButton
                size={isSmallScreen ? "small" : "medium"}
                onClick={handleSendMessage}
                // disabled={!isTyping}
                // className={` ${
                //   lightTheme
                //     ? "bg-blue-500 hover:bg-blue-600 text-white"
                //     : "bg-blue-600  hover:bg-blue-700 text-white"
                // }`}
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
    </div>
  );
};

export default ChatArea;
