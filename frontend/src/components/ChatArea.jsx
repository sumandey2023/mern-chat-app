// import React, { useEffect, useRef, useState } from "react";
// import DeleteIcon from "@mui/icons-material/Delete";
// import MessageOther from "./MessageOther";
// import MessageSelf from "./MessageSelf";
// import MicIcon from "@mui/icons-material/Mic";
// import AttachFileIcon from "@mui/icons-material/AttachFile";
// import TelegramIcon from "@mui/icons-material/Telegram";
// import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
// import CloseIcon from "@mui/icons-material/Close";
// import { Avatar, IconButton, Tooltip, ClickAwayListener } from "@mui/material";
// import { useMediaQuery } from "react-responsive";
// import { useSelector } from "react-redux";
// import { useParams } from "react-router-dom";
// import api from "../../config/axios";
// import EmojiPicker from "emoji-picker-react";
// import { io } from "socket.io-client";
// import BASE_URL from "../../config/api";

// const ChatArea = () => {
//   const isSmallScreen = useMediaQuery({ maxWidth: 1150 });
//   const lightTheme = useSelector((state) => state.themeKey);
//   const [receiverData, setReceiverData] = useState([]);
//   const [messages, setMessages] = useState([]);
//   const [loggedInUser, setLoggedInUser] = useState({});
//   const [messageToBeSend, setMessageToBeSend] = useState("");
//   const [isTyping, setIsTyping] = useState(false);
//   const [receiverIsTyping, setReceiverIsTyping] = useState(false);
//   const [showEmojiPicker, setShowEmojiPicker] = useState(false);
//   const [onlineUsers, setOnlineUsers] = useState([]);
//   const scrollRef = useRef(null);
//   const inputRef = useRef(null);
//   const emojiPickerRef = useRef(null);
//   const socket = useRef();
//   const typingTimeoutRef = useRef(null);
//   const { id } = useParams();

//   // Initialize socket connection
//   useEffect(() => {
//     socket.current = io(BASE_URL);

//     // Listen for events
//     socket.current.on("receiveMessage", (data) => {
//       setMessages((prev) => [...prev, data]);
//     });

//     socket.current.on("userTyping", (data) => {
//       if (data.senderId === id) {
//         setReceiverIsTyping(data.isTyping);
//       }
//     });

//     socket.current.on("getUsers", (users) => {
//       setOnlineUsers(users);
//     });

//     // Clean up on component unmount
//     return () => {
//       socket.current.disconnect();
//     };
//   }, []);

//   // Add user to socket when logged in
//   useEffect(() => {
//     if (loggedInUser && loggedInUser._id) {
//       socket.current.emit("addUser", loggedInUser._id);
//     }
//   }, [loggedInUser]);

//   useEffect(() => {
//     const fetchReceiverData = async () => {
//       try {
//         const data = await api.get(`/user/get-chat-user/${id}`, {
//           credentials: "include",
//           headers: {
//             "Content-Type": "application/json",
//           },
//         });

//         const receivedData = data.data;
//         console.log("Receiver Data:", receivedData);
//         setReceiverData(receivedData);
//       } catch (error) {
//         console.log(error);
//       }
//     };

//     fetchReceiverData();
//   }, [id]);

//   useEffect(() => {
//     const getLoggedInUser = async () => {
//       try {
//         const { data } = await api.get("/user/get-user-details", {
//           withCredentials: true,
//         });
//         setLoggedInUser(data.user);
//       } catch (error) {
//         console.log(error);
//       }
//     };
//     getLoggedInUser();
//   }, []);

//   useEffect(() => {
//     const fetchChat = async () => {
//       try {
//         const res = await api.get(`/message/${id}`, {
//           withCredentials: true,
//           headers: {
//             "Content-Type": "application/json",
//           },
//         });

//         setMessages(res.data);
//       } catch (error) {
//         console.log(error);
//       }
//     };
//     fetchChat();
//   }, [id]);

//   useEffect(() => {
//     if (scrollRef.current) {
//       scrollRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [messages]);

//   useEffect(() => {
//     if (receiverIsTyping && scrollRef.current) {
//       scrollRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [receiverIsTyping]);

//   useEffect(() => {
//     const addUserToChatList = async (userId) => {
//       try {
//         const res = await api.post(
//           "/user/add-to-chat-list",
//           { userId },
//           { withCredentials: true }
//         );
//       } catch (error) {
//         console.error("Error adding user to chat list:", error);
//       }
//     };

//     addUserToChatList(id);
//   }, []);

//   const handleSendMessage = async () => {
//     if (!messageToBeSend.trim()) return;

//     try {
//       const { data } = await api.post(
//         `/message/send/${id}`,
//         {
//           text: messageToBeSend,
//         },
//         {
//           headers: {
//             "Content-Type": "application/json",
//           },
//           withCredentials: true,
//         }
//       );

//       // Send message through socket
//       socket.current.emit("sendMessage", {
//         ...data,
//         receiverId: id,
//         senderId: loggedInUser._id,
//       });

//       // Update local state
//       setMessages((prev) => [...prev, data]);
//       setMessageToBeSend("");
//       setShowEmojiPicker(false);

//       // Send stop typing event
//       socket.current.emit("typing", {
//         senderId: loggedInUser._id,
//         receiverId: id,
//         isTyping: false,
//       });

//       setTimeout(() => {
//         const chatContainer = document.querySelector(".chat-container");
//         if (chatContainer) {
//           chatContainer.scrollTop = chatContainer.scrollHeight;
//         }
//       }, 100);
//     } catch (error) {
//       console.error("Failed to send message:", error);
//     }
//   };

//   const handleTyping = (e) => {
//     setMessageToBeSend(e.target.value);

//     // Send typing status to socket
//     if (!isTyping) {
//       setIsTyping(true);
//       socket.current.emit("typing", {
//         senderId: loggedInUser._id,
//         receiverId: id,
//         isTyping: true,
//       });
//     }

//     // Clear previous timeout
//     if (typingTimeoutRef.current) {
//       clearTimeout(typingTimeoutRef.current);
//     }

//     // Set new timeout for when user stops typing
//     typingTimeoutRef.current = setTimeout(() => {
//       socket.current.emit("typing", {
//         senderId: loggedInUser._id,
//         receiverId: id,
//         isTyping: false,
//       });
//       setIsTyping(false);
//     }, 2000);
//   };

//   const handleEmojiClick = (emojiData) => {
//     const emoji = emojiData.emoji;
//     const cursorPosition = inputRef.current.selectionStart;
//     const textBeforeCursor = messageToBeSend.slice(0, cursorPosition);
//     const textAfterCursor = messageToBeSend.slice(cursorPosition);
//     const newText = textBeforeCursor + emoji + textAfterCursor;

//     setMessageToBeSend(newText);

//     // Focus on input and set cursor position after emoji
//     setTimeout(() => {
//       inputRef.current.focus();
//       const newCursorPosition = cursorPosition + emoji.length;
//       inputRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
//     }, 10);
//   };

//   const toggleEmojiPicker = () => {
//     setShowEmojiPicker((prev) => !prev);
//   };

//   const handleClickAway = () => {
//     if (showEmojiPicker) {
//       setShowEmojiPicker(false);
//     }
//   };

//   const formatTime = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleTimeString([], {
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   // Function to format date for message date headers
//   const formatMessageDate = (dateString) => {
//     const date = new Date(dateString);
//     const today = new Date();
//     const yesterday = new Date(today);
//     yesterday.setDate(yesterday.getDate() - 1);

//     // Check if date is today
//     if (
//       date.getDate() === today.getDate() &&
//       date.getMonth() === today.getMonth() &&
//       date.getFullYear() === today.getFullYear()
//     ) {
//       return "Today";
//     }

//     // Check if date is yesterday
//     if (
//       date.getDate() === yesterday.getDate() &&
//       date.getMonth() === yesterday.getMonth() &&
//       date.getFullYear() === yesterday.getFullYear()
//     ) {
//       return "Yesterday";
//     }

//     // Return formatted date for older messages
//     return date.toLocaleDateString(undefined, {
//       weekday: "long",
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     });
//   };

//   // Check if user is online
//   const isUserOnline = onlineUsers.includes(receiverData._id);

//   // Group messages by date
//   const groupMessagesByDate = () => {
//     const groupedMessages = [];
//     let currentDate = null;

//     messages.forEach((message) => {
//       const messageDate = new Date(message.createdAt).setHours(0, 0, 0, 0);

//       if (currentDate !== messageDate) {
//         currentDate = messageDate;
//         groupedMessages.push({
//           type: "date",
//           date: message.createdAt,
//           id: `date-${messageDate}`,
//         });
//       }

//       groupedMessages.push({
//         type: "message",
//         data: message,
//       });
//     });

//     return groupedMessages;
//   };

//   const groupedMessages = groupMessagesByDate();

//   return (
//     <div
//       className={`grow py-4 px-3 h-full transition-colors duration-300 ${
//         lightTheme ? "bg-gray-100" : "bg-[#181C14]"
//       } transition-all duration-300`}
//     >
//       <div
//         className={`flex flex-col h-full rounded-2xl shadow-lg overflow-hidden transition-colors duration-300 ${
//           lightTheme ? "bg-white" : "bg-[#3C3D37]"
//         }transition-all duration-300 `}
//       >
//         {/* Header */}
//         <div
//           className={`flex items-center px-4 py-3 border-b transition-colors duration-300 ${
//             lightTheme
//               ? "bg-white border-gray-200"
//               : "bg-[#2A2D27] border-gray-700"
//           } transition-all duration-300`}
//         >
//           <div className="relative">
//             <Avatar
//               alt={receiverData?.name || "User"}
//               src={receiverData?.pic}
//               sx={{
//                 width: 50,
//                 height: 50,
//                 border: `2px solid ${
//                   lightTheme ? "#e5e7eb" : "#4b5563"
//                 } transition-all duration-300`,
//                 boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
//               }}
//             />
//             <span
//               className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full ${
//                 isUserOnline ? "bg-green-400" : "bg-gray-400"
//               } border-2 ${
//                 lightTheme ? "border-white" : "border-[#2A2D27]"
//               } transition-all duration-300`}
//             ></span>
//           </div>

//           <div className="ml-3 flex-grow">
//             <h1
//               className={`text-base lg:text-lg font-semibold ${
//                 lightTheme ? "text-gray-800" : "text-white"
//               } transition-all duration-300`}
//             >
//               {receiverData.name || "Loading..."}
//             </h1>
//             <p
//               className={`text-xs ${
//                 isUserOnline
//                   ? lightTheme
//                     ? "text-green-600"
//                     : "text-green-400"
//                   : lightTheme
//                   ? "text-gray-500"
//                   : "text-gray-400"
//               } transition-all duration-300`}
//             >
//               {isUserOnline ? "Online" : "Offline"}
//             </p>
//           </div>
//         </div>

//         {/* Chat Messages Area with Fixed Scrollbar */}
//         <div
//           className={`flex-1 p-3 lg:p-4 overflow-y-auto chat-container scroll-smooth no-scrollbar ${
//             lightTheme
//               ? "bg-gray-50 "
//               : "bg-gradient-to-b from-[#2A2D27] to-[#323329] "
//           } transition-all duration-300`}
//           style={{
//             overflowY: "auto",
//           }}
//         >
//           {groupedMessages.map((item, index) => {
//             if (item.type === "date") {
//               return (
//                 <div key={item.id} className="flex justify-center my-3">
//                   <div
//                     className={`px-3 py-1 rounded-full text-xs font-medium ${
//                       lightTheme
//                         ? "bg-gray-200 text-gray-600"
//                         : "bg-gray-700 text-gray-300"
//                     }`}
//                   >
//                     {formatMessageDate(item.date)}
//                   </div>
//                 </div>
//               );
//             } else {
//               const message = item.data;
//               const time = formatTime(message.createdAt);
//               return message.senderId === loggedInUser._id ? (
//                 <MessageSelf
//                   key={`msg-${index}`}
//                   text={message.text}
//                   time={time}
//                 />
//               ) : (
//                 <MessageOther
//                   key={`msg-${index}`}
//                   text={message.text}
//                   pic={receiverData?.pic}
//                   time={time}
//                 />
//               );
//             }
//           })}

//           {/* Typing indicator */}
//           {/* {receiverIsTyping && (
//             <div className="flex items-center gap-2 mt-2 mb-2 px-2">
//               <Avatar
//                 alt={receiverData?.name || "User"}
//                 src={receiverData?.pic}
//                 sx={{ width: 24, height: 24 }}
//               />
//               <div
//                 className={`px-3 py-2 rounded-lg ${
//                   lightTheme ? "bg-gray-200" : "bg-[#4A4B45]"
//                 }`}
//               >
//                 <div className="flex gap-1">
//                   <span
//                     className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"
//                     style={{ animationDelay: "0ms" }}
//                   ></span>
//                   <span
//                     className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"
//                     style={{ animationDelay: "200ms" }}
//                   ></span>
//                   <span
//                     className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"
//                     style={{ animationDelay: "400ms" }}
//                   ></span>
//                 </div>
//               </div>
//             </div>
//           )} */}

//           {receiverIsTyping && (
//             <div className="flex items-center gap-2 mt-2 mb-2 px-2">
//               <Avatar
//                 alt={receiverData?.name || "User"}
//                 src={receiverData?.pic}
//                 sx={{ width: 24, height: 24 }}
//               />
//               <div
//                 className={`px-3 py-2 rounded-lg ${
//                   lightTheme ? "bg-gray-200" : "bg-[#4A4B45]"
//                 }`}
//               >
//                 <div className="flex gap-1">
//                   <span
//                     className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"
//                     style={{ animationDelay: "0ms" }}
//                   ></span>
//                   <span
//                     className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"
//                     style={{ animationDelay: "200ms" }}
//                   ></span>
//                   <span
//                     className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"
//                     style={{ animationDelay: "400ms" }}
//                   ></span>
//                 </div>
//               </div>
//             </div>
//           )}

//           <div ref={scrollRef} />
//         </div>

//         {/* Properly Aligned Footer with Input and Buttons */}
//         <div
//           className={`px-3 py-2 border-t transition-colors duration-300 ${
//             lightTheme
//               ? "bg-white border-gray-200"
//               : "bg-[#2A2D27] border-gray-700"
//           } transition-all duration-300`}
//         >
//           <div className="flex items-center gap-2">
//             <Tooltip title="Attach File">
//               <IconButton
//                 size="small"
//                 className={`flex-shrink-0 hover:scale-110 transition-transform duration-300 ${
//                   lightTheme ? "hover:bg-gray-100" : "hover:bg-[#3C3D37]"
//                 } transition-all duration-300`}
//               >
//                 <AttachFileIcon
//                   className={lightTheme ? "text-gray-600" : "text-gray-300"}
//                   fontSize="small"
//                 />
//               </IconButton>
//             </Tooltip>

//             <ClickAwayListener onClickAway={handleClickAway}>
//               <div className="relative">
//                 <Tooltip title="Emojis">
//                   <IconButton
//                     size="small"
//                     onClick={toggleEmojiPicker}
//                     className={`flex-shrink-0 hover:scale-110 transition-transform duration-300 ${
//                       lightTheme ? "hover:bg-gray-100" : "hover:bg-[#3C3D37]"
//                     } ${
//                       showEmojiPicker
//                         ? lightTheme
//                           ? "bg-gray-200"
//                           : "bg-[#4A4B45]"
//                         : ""
//                     }`}
//                   >
//                     <EmojiEmotionsIcon
//                       className={lightTheme ? "text-gray-600" : "text-gray-300"}
//                       fontSize="small"
//                     />
//                   </IconButton>
//                 </Tooltip>

//                 {showEmojiPicker && (
//                   <div
//                     ref={emojiPickerRef}
//                     className="absolute bottom-12 left-0 z-10"
//                   >
//                     <div
//                       className={`p-2 rounded-lg shadow-lg ${
//                         lightTheme ? "bg-white" : "bg-[#2A2D27]"
//                       }`}
//                     >
//                       <div className="flex justify-between items-center mb-2 px-2">
//                         <span
//                           className={`text-sm font-medium ${
//                             lightTheme ? "text-gray-700" : "text-gray-300"
//                           }`}
//                         >
//                           Emojis
//                         </span>
//                         <IconButton
//                           size="small"
//                           onClick={() => setShowEmojiPicker(false)}
//                         >
//                           <CloseIcon
//                             fontSize="small"
//                             className={
//                               lightTheme ? "text-gray-500" : "text-gray-400"
//                             }
//                           />
//                         </IconButton>
//                       </div>
//                       <EmojiPicker
//                         onEmojiClick={handleEmojiClick}
//                         autoFocusSearch={false}
//                         theme={lightTheme ? "light" : "dark"}
//                         searchDisabled
//                         skinTonesDisabled
//                         height={350}
//                         width={isSmallScreen ? 250 : 320}
//                       />
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </ClickAwayListener>

//             <div className="relative flex-1">
//               <input
//                 ref={inputRef}
//                 type="text"
//                 value={messageToBeSend}
//                 onChange={handleTyping}
//                 placeholder="Type a message..."
//                 onKeyDown={(e) => {
//                   if (e.key === "Enter" && !e.shiftKey) {
//                     e.preventDefault();
//                     handleSendMessage();
//                   }
//                 }}
//                 className={`flex-1 w-full p-3 rounded-full outline-none text-base lg:text-lg transition-all ${
//                   lightTheme
//                     ? "bg-gray-100 text-gray-800 focus:bg-gray-200 focus:shadow-inner"
//                     : "bg-[#3C3D37] text-white focus:bg-[#444440] focus:shadow-inner"
//                 } transition-all duration-300`}
//               />
//             </div>

//             <Tooltip title="Voice Message">
//               <IconButton
//                 size="small"
//                 className={`flex-shrink-0 hover:scale-110 transition-transform duration-300 ${
//                   lightTheme ? "hover:bg-gray-100" : "hover:bg-[#3C3D37]"
//                 } transition-all duration-300`}
//               >
//                 <MicIcon
//                   className={lightTheme ? "text-gray-600" : "text-gray-300"}
//                   fontSize="small"
//                 />
//               </IconButton>
//             </Tooltip>

//             <Tooltip title="Send message" placement="top">
//               <IconButton
//                 size={isSmallScreen ? "small" : "medium"}
//                 onClick={handleSendMessage}
//                 disabled={!messageToBeSend.trim()}
//                 className={`${
//                   messageToBeSend.trim() ? "opacity-100" : "opacity-60"
//                 }`}
//               >
//                 <TelegramIcon
//                   className={`${
//                     messageToBeSend.trim()
//                       ? lightTheme
//                         ? "text-blue-500"
//                         : "text-blue-400"
//                       : lightTheme
//                       ? "text-gray-400"
//                       : "text-gray-500"
//                   }`}
//                   fontSize={isSmallScreen ? "small" : "medium"}
//                 />
//               </IconButton>
//             </Tooltip>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ChatArea;

import React, { useEffect, useRef, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import MessageOther from "./MessageOther";
import MessageSelf from "./MessageSelf";
import MicIcon from "@mui/icons-material/Mic";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import TelegramIcon from "@mui/icons-material/Telegram";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import CloseIcon from "@mui/icons-material/Close";
import InfoIcon from "@mui/icons-material/Info";
import EmailIcon from "@mui/icons-material/Email";
import PersonIcon from "@mui/icons-material/Person";
import AlternateEmailIcon from "@mui/icons-material/AlternateEmail";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ChatIcon from "@mui/icons-material/Chat";
import {
  Avatar,
  IconButton,
  Tooltip,
  ClickAwayListener,
  Collapse,
  Box,
  Typography,
  Divider,
  Button,
} from "@mui/material";
import { useMediaQuery } from "react-responsive";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import api from "../../config/axios";
import EmojiPicker from "emoji-picker-react";
import { io } from "socket.io-client";
import BASE_URL from "../../config/api";
import { format } from "date-fns";

const ChatArea = () => {
  const isSmallScreen = useMediaQuery({ maxWidth: 1150 });
  const lightTheme = useSelector((state) => state.themeKey);
  const [receiverData, setReceiverData] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState({});
  const [messageToBeSend, setMessageToBeSend] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [receiverIsTyping, setReceiverIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showUserInfo, setShowUserInfo] = useState(false); // Added state for user info panel
  const [onlineUsers, setOnlineUsers] = useState([]);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const socket = useRef();
  const typingTimeoutRef = useRef(null);
  const { id } = useParams();

  // Initialize socket connection
  useEffect(() => {
    socket.current = io(BASE_URL);

    // Listen for events
    socket.current.on("receiveMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.current.on("userTyping", (data) => {
      if (data.senderId === id) {
        setReceiverIsTyping(data.isTyping);
      }
    });

    socket.current.on("getUsers", (users) => {
      setOnlineUsers(users);
    });

    // Clean up on component unmount
    return () => {
      socket.current.disconnect();
    };
  }, []);

  // Add user to socket when logged in
  useEffect(() => {
    if (loggedInUser && loggedInUser._id) {
      socket.current.emit("addUser", loggedInUser._id);
    }
  }, [loggedInUser]);

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
        console.log("Receiver Data:", receivedData);
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

  useEffect(() => {
    if (receiverIsTyping && scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [receiverIsTyping]);

  useEffect(() => {
    const addUserToChatList = async (userId) => {
      try {
        const res = await api.post(
          "/user/add-to-chat-list",
          { userId },
          { withCredentials: true }
        );
      } catch (error) {
        console.error("Error adding user to chat list:", error);
      }
    };

    addUserToChatList(id);
  }, []);

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

      // Send message through socket
      socket.current.emit("sendMessage", {
        ...data,
        receiverId: id,
        senderId: loggedInUser._id,
      });

      // Update local state
      setMessages((prev) => [...prev, data]);
      setMessageToBeSend("");
      setShowEmojiPicker(false);

      // Send stop typing event
      socket.current.emit("typing", {
        senderId: loggedInUser._id,
        receiverId: id,
        isTyping: false,
      });

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

    // Send typing status to socket
    if (!isTyping) {
      setIsTyping(true);
      socket.current.emit("typing", {
        senderId: loggedInUser._id,
        receiverId: id,
        isTyping: true,
      });
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout for when user stops typing
    typingTimeoutRef.current = setTimeout(() => {
      socket.current.emit("typing", {
        senderId: loggedInUser._id,
        receiverId: id,
        isTyping: false,
      });
      setIsTyping(false);
    }, 2000);
  };

  const handleEmojiClick = (emojiData) => {
    const emoji = emojiData.emoji;
    const cursorPosition = inputRef.current.selectionStart;
    const textBeforeCursor = messageToBeSend.slice(0, cursorPosition);
    const textAfterCursor = messageToBeSend.slice(cursorPosition);
    const newText = textBeforeCursor + emoji + textAfterCursor;

    setMessageToBeSend(newText);

    // Focus on input and set cursor position after emoji
    setTimeout(() => {
      inputRef.current.focus();
      const newCursorPosition = cursorPosition + emoji.length;
      inputRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
    }, 10);
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker((prev) => !prev);
  };

  const handleClickAway = () => {
    if (showEmojiPicker) {
      setShowEmojiPicker(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Function to format date for message date headers
  const formatMessageDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if date is today
    if (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    ) {
      return "Today";
    }

    // Check if date is yesterday
    if (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    ) {
      return "Yesterday";
    }

    // Return formatted date for older messages
    return date.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format date for user profile info
  const formatJoinDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMMM d, yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  // Check if user is online
  const isUserOnline = onlineUsers.includes(receiverData._id);

  // Group messages by date
  const groupMessagesByDate = () => {
    const groupedMessages = [];
    let currentDate = null;

    messages.forEach((message) => {
      const messageDate = new Date(message.createdAt).setHours(0, 0, 0, 0);

      if (currentDate !== messageDate) {
        currentDate = messageDate;
        groupedMessages.push({
          type: "date",
          date: message.createdAt,
          id: `date-${messageDate}`,
        });
      }

      groupedMessages.push({
        type: "message",
        data: message,
      });
    });

    return groupedMessages;
  };

  const groupedMessages = groupMessagesByDate();

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
          className={`flex items-center justify-between px-4 py-3 border-b transition-colors duration-300 ${
            lightTheme
              ? "bg-white border-gray-200"
              : "bg-[#2A2D27] border-gray-700"
          } transition-all duration-300`}
        >
          <div className="flex items-center">
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
                className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full ${
                  isUserOnline ? "bg-green-400" : "bg-gray-400"
                } border-2 ${
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
                  isUserOnline
                    ? lightTheme
                      ? "text-green-600"
                      : "text-green-400"
                    : lightTheme
                    ? "text-gray-500"
                    : "text-gray-400"
                } transition-all duration-300`}
              >
                {isUserOnline ? "Online" : "Offline"}
              </p>
            </div>
          </div>

          {/* User Info Toggle Button */}
          <div className="flex items-center">
            <Tooltip title="User Info">
              <IconButton
                onClick={() => setShowUserInfo(!showUserInfo)}
                className={`${
                  showUserInfo
                    ? lightTheme
                      ? "bg-gray-200"
                      : "bg-[#4A4B45]"
                    : ""
                }`}
              >
                <InfoIcon
                  className={lightTheme ? "text-gray-700" : "text-gray-300"}
                />
              </IconButton>
            </Tooltip>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Main chat area */}
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Chat Messages Area with Fixed Scrollbar */}
            <div
              className={`flex-1 p-3 lg:p-4 overflow-y-auto chat-container scroll-smooth no-scrollbar ${
                lightTheme
                  ? "bg-gray-50 "
                  : "bg-gradient-to-b from-[#2A2D27] to-[#323329] "
              } transition-all duration-300`}
              style={{
                overflowY: "auto",
              }}
            >
              {groupedMessages.map((item, index) => {
                if (item.type === "date") {
                  return (
                    <div key={item.id} className="flex justify-center my-3">
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          lightTheme
                            ? "bg-gray-200 text-gray-600"
                            : "bg-gray-700 text-gray-300"
                        }`}
                      >
                        {formatMessageDate(item.date)}
                      </div>
                    </div>
                  );
                } else {
                  const message = item.data;
                  const time = formatTime(message.createdAt);
                  return message.senderId === loggedInUser._id ? (
                    <MessageSelf
                      key={`msg-${index}`}
                      text={message.text}
                      time={time}
                    />
                  ) : (
                    <MessageOther
                      key={`msg-${index}`}
                      text={message.text}
                      pic={receiverData?.pic}
                      time={time}
                    />
                  );
                }
              })}

              {/* Typing indicator */}
              {receiverIsTyping && (
                <div className="flex items-center gap-2 mt-2 mb-2 px-2">
                  <Avatar
                    alt={receiverData?.name || "User"}
                    src={receiverData?.pic}
                    sx={{ width: 24, height: 24 }}
                  />
                  <div
                    className={`px-3 py-2 rounded-lg ${
                      lightTheme ? "bg-gray-200" : "bg-[#4A4B45]"
                    }`}
                  >
                    <div className="flex gap-1">
                      <span
                        className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></span>
                      <span
                        className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"
                        style={{ animationDelay: "200ms" }}
                      ></span>
                      <span
                        className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"
                        style={{ animationDelay: "400ms" }}
                      ></span>
                    </div>
                  </div>
                </div>
              )}

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

                <ClickAwayListener onClickAway={handleClickAway}>
                  <div className="relative">
                    <Tooltip title="Emojis">
                      <IconButton
                        size="small"
                        onClick={toggleEmojiPicker}
                        className={`flex-shrink-0 hover:scale-110 transition-transform duration-300 ${
                          lightTheme
                            ? "hover:bg-gray-100"
                            : "hover:bg-[#3C3D37]"
                        } ${
                          showEmojiPicker
                            ? lightTheme
                              ? "bg-gray-200"
                              : "bg-[#4A4B45]"
                            : ""
                        }`}
                      >
                        <EmojiEmotionsIcon
                          className={
                            lightTheme ? "text-gray-600" : "text-gray-300"
                          }
                          fontSize="small"
                        />
                      </IconButton>
                    </Tooltip>

                    {showEmojiPicker && (
                      <div
                        ref={emojiPickerRef}
                        className="absolute bottom-12 left-0 z-10"
                      >
                        <div
                          className={`p-2 rounded-lg shadow-lg ${
                            lightTheme ? "bg-white" : "bg-[#2A2D27]"
                          }`}
                        >
                          <div className="flex justify-between items-center mb-2 px-2">
                            <span
                              className={`text-sm font-medium ${
                                lightTheme ? "text-gray-700" : "text-gray-300"
                              }`}
                            >
                              Emojis
                            </span>
                            <IconButton
                              size="small"
                              onClick={() => setShowEmojiPicker(false)}
                            >
                              <CloseIcon
                                fontSize="small"
                                className={
                                  lightTheme ? "text-gray-500" : "text-gray-400"
                                }
                              />
                            </IconButton>
                          </div>
                          <EmojiPicker
                            onEmojiClick={handleEmojiClick}
                            autoFocusSearch={false}
                            theme={lightTheme ? "light" : "dark"}
                            searchDisabled
                            skinTonesDisabled
                            height={350}
                            width={isSmallScreen ? 250 : 320}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </ClickAwayListener>

                <div className="relative flex-1">
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

                <Tooltip title="Send message" placement="top">
                  <IconButton
                    size={isSmallScreen ? "small" : "medium"}
                    onClick={handleSendMessage}
                    disabled={!messageToBeSend.trim()}
                    className={`${
                      messageToBeSend.trim() ? "opacity-100" : "opacity-60"
                    }`}
                  >
                    <TelegramIcon
                      className={`${
                        messageToBeSend.trim()
                          ? lightTheme
                            ? "text-blue-500"
                            : "text-blue-400"
                          : lightTheme
                          ? "text-gray-400"
                          : "text-gray-500"
                      }`}
                      fontSize={isSmallScreen ? "small" : "medium"}
                    />
                  </IconButton>
                </Tooltip>
              </div>
            </div>
          </div>

          {/* User Info Side Panel */}
          <Collapse in={showUserInfo} orientation="horizontal">
            <div
              className={`w-72 border-l overflow-y-auto ${
                lightTheme
                  ? "bg-white border-gray-200"
                  : "bg-[#2A2D27] border-gray-700"
              } transition-all duration-300`}
            >
              <div className="p-4">
                {/* User Profile Header */}
                <div className="flex justify-center  mb-4">
                  <Avatar
                    alt={receiverData?.name || "User"}
                    src={receiverData?.pic}
                    sx={{
                      width: 100,
                      height: 100,
                      border: `3px solid ${
                        isUserOnline
                          ? lightTheme
                            ? "#10B981"
                            : "#34D399"
                          : lightTheme
                          ? "#3498DB"
                          : "#4DD0E1"
                      }`,
                      bgcolor: lightTheme ? "#f0f7fc" : "#223240",
                      boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
                    }}
                  >
                    {!receiverData?.pic && (
                      <PersonIcon
                        sx={{
                          fontSize: "3rem",
                          color: lightTheme ? "#3498DB" : "#4DD0E1",
                        }}
                      />
                    )}
                  </Avatar>
                </div>

                <Typography
                  variant="h6"
                  align="center"
                  className={`font-semibold ${
                    lightTheme ? "text-gray-800" : "text-white"
                  }`}
                >
                  {receiverData?.name || "User"}
                </Typography>

                <Typography
                  variant="body2"
                  align="center"
                  className={`mt-1 ${
                    isUserOnline
                      ? lightTheme
                        ? "text-green-600"
                        : "text-green-400"
                      : lightTheme
                      ? "text-gray-600"
                      : "text-gray-300"
                  }`}
                >
                  {isUserOnline ? "Online" : "Offline"}
                </Typography>

                {/* User Info Card */}
                <Box
                  className={`mt-6 p-4 rounded-lg ${
                    lightTheme ? "bg-gray-50" : "bg-[#3C3D37]"
                  } transition-all duration-300 shadow-sm hover:shadow-md`}
                >
                  <Typography
                    variant="subtitle2"
                    className={`mb-3 font-medium ${
                      lightTheme ? "text-gray-700" : "text-gray-200"
                    }`}
                  >
                    PROFILE INFORMATION
                  </Typography>

                  <div className="space-y-4">
                    {/* Username */}
                    {receiverData?.username && (
                      <div className="flex items-center">
                        <AlternateEmailIcon
                          className={`mr-3 ${
                            lightTheme ? "text-blue-500" : "text-blue-400"
                          }`}
                          fontSize="small"
                        />
                        <div>
                          <Typography
                            variant="body2"
                            className={`text-xs ${
                              lightTheme ? "text-gray-500" : "text-gray-400"
                            }`}
                          >
                            Username
                          </Typography>
                          <Typography
                            variant="body1"
                            className={
                              lightTheme ? "text-gray-800" : "text-gray-200"
                            }
                          >
                            @{receiverData.username}
                          </Typography>
                        </div>
                      </div>
                    )}

                    {/* Email */}
                    {receiverData?.email && (
                      <div className="flex items-center">
                        <EmailIcon
                          className={`mr-3 ${
                            lightTheme ? "text-blue-500" : "text-blue-400"
                          }`}
                          fontSize="small"
                        />
                        <div>
                          <Typography
                            variant="body2"
                            className={`text-xs ${
                              lightTheme ? "text-gray-500" : "text-gray-400"
                            }`}
                          >
                            Email
                          </Typography>
                          <Typography
                            variant="body1"
                            className={
                              lightTheme ? "text-gray-800" : "text-gray-200"
                            }
                          >
                            {receiverData.email}
                          </Typography>
                        </div>
                      </div>
                    )}

                    {/* Joined Date */}
                    {receiverData?.createdAt && (
                      <div className="flex items-center">
                        <CalendarTodayIcon
                          className={`mr-3 ${
                            lightTheme ? "text-blue-500" : "text-blue-400"
                          }`}
                          fontSize="small"
                        />
                        <div>
                          <Typography
                            variant="body2"
                            className={`text-xs ${
                              lightTheme ? "text-gray-500" : "text-gray-400"
                            }`}
                          >
                            Joined
                          </Typography>
                          <Typography
                            variant="body1"
                            className={
                              lightTheme ? "text-gray-800" : "text-gray-200"
                            }
                          >
                            {formatJoinDate(receiverData.createdAt)}
                          </Typography>
                        </div>
                      </div>
                    )}
                  </div>
                </Box>

                {/* Action Button */}
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<ChatIcon />}
                  className="mt-4"
                  sx={{
                    mt: 4,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: "none",
                    background: lightTheme ? "#3498DB" : "#4DD0E1",
                    "&:hover": {
                      background: lightTheme ? "#2980B9" : "#26C6DA",
                    },
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  Continue Chatting
                </Button>
              </div>
            </div>
          </Collapse>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
