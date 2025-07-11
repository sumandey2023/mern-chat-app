import { io } from "socket.io-client";

import React, { useEffect, useRef, useState } from "react";
import NightlightIcon from "@mui/icons-material/Nightlight";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import PublicIcon from "@mui/icons-material/Public";
import QrCodeIcon from "@mui/icons-material/QrCode";
import GroupIcon from "@mui/icons-material/Group";
import PanoramaFishEyeIcon from "@mui/icons-material/PanoramaFishEye";
import VideocamIcon from "@mui/icons-material/Videocam";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ChatIcon from "@mui/icons-material/Chat";
import SearchIcon from "@mui/icons-material/Search";
import SunnyIcon from "@mui/icons-material/Sunny";
import CloseIcon from "@mui/icons-material/Close";
import DocumentScannerIcon from "@mui/icons-material/DocumentScanner";
import {
  IconButton,
  Tooltip,
  Badge,
  Avatar,
  CircularProgress,
} from "@mui/material";
import ConversationsItem from "./ConversationItem";
import { useNavigate, useLocation } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../Features/theamSlice";
import api from "../config/api";

const SideNavChatList = () => {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const lightTheme = useSelector((state) => state.themeKey);
  const isSmallScreen = useMediaQuery({ maxWidth: 1150 });
  const isChatRoute = location.pathname.includes("/chat");
  const isCreateGroupRoute = location.pathname.includes("/create-group");
  const [chatList, setChatList] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const socket = useRef();

  // On mobile, if we're in a chat or create-group, don't show the chat list
  if (isSmallScreen && (isChatRoute || isCreateGroupRoute)) {
    return null;
  }

  const fetchChatList = async () => {
    try {
      const { data } = await api.get("/user/chatList", {
        withCredentials: true,
      });
      setChatList(data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    fetchChatList();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsSearching(true);
      setSearchError(null);
      try {
        const res = await fetch(
          `${api.defaults.baseURL}/user/searchUsers?search=${search}`,
          {
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) {
          if (res.status === 401) {
            setSearchError("Please login to search users");
            setData([]);
            return;
          }
          throw new Error("Failed to fetch users");
        }

        const result = await res.json();
        setData(result);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        setSearchError("Failed to search users. Please try again.");
        setData([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      if (search.trim() !== "") {
        fetchUsers();
      } else {
        setData([]);
        setSearchError(null);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [search]);

  useEffect(() => {
    socket.current = io(api.defaults.baseURL, {
      withCredentials: true,
    });

    // Listen for online users updates
    socket.current.on("getUsers", (users) => {
      setOnlineUsers(users);
    });

    // Add current user to online users when component mounts
    const addCurrentUser = async () => {
      try {
        const { data } = await api.get("/user/get-user-details", {
          withCredentials: true,
        });
        if (data.user && data.user._id) {
          socket.current.emit("addUser", data.user._id);
        }
      } catch (error) {
        console.error("Error getting user details:", error);
      }
    };

    addCurrentUser();

    return () => {
      socket.current.disconnect();
    };
  }, []);

  const clearSearch = () => {
    setSearch("");
  };

  const addUserToChatList = async (userId) => {
    try {
      const res = await api.post(
        "/user/add-to-chat-list",
        { userId },
        { withCredentials: true }
      );
      if (res.status === 200) {
        console.log("User added to chat list successfully");
        // Refresh chat list after successful addition
        fetchChatList();
      } else {
        console.error("Failed to add user to chat list");
      }
    } catch (error) {
      console.error("Error adding user to chat list:", error);
    }
  };

  // Navigation items for cleaner rendering
  const navigationItems = [
    {
      icon: <GroupIcon className="text-white" />,
      label: "Groups",
      action: () => navigate("groups"),
    },
    // {
    //   icon: <AddCircleOutlineIcon className="text-white" />,
    //   label: "Create Group",
    //   action: () => navigate("create-group"),
    // },
    {
      icon: <PanoramaFishEyeIcon className="text-white" />,
      label: "AI Chat",
      action: () => navigate("ai-chat"),
    },
    {
      icon: <QrCodeIcon className="text-white" />,
      label: "Share Profile",
      action: () => navigate("profileShare"),
    },
    {
      icon: <DocumentScannerIcon className="text-white" />,
      label: "scanner",
      action: () => navigate("scanner"),
    },
    {
      icon: <VideocamIcon className="text-white" />,
      label: "Video",
      // action: () => navigate("videoChat"),
      action: () => alert("Coming Soon"),
      badge: 2, // Example badge count
    },
  ];

  const bottomNavigationItems = [
    {
      icon: <PublicIcon className="text-white" />,
      label: "Public",
      action: () => navigate("public"),
    },
    {
      icon: <AccountCircleIcon className="text-white" />,
      label: "Profile",
      action: () => navigate("profile"),
    },
  ];

  return (
    <>
      {/* Side Navigation Bar */}
      <div
        className={`w-[70px] flex flex-col justify-between py-6 shadow-xl ${
          lightTheme ? "bg-[#4141FF]" : "!bg-[#2A2D27]"
        } transition-all duration-300`}
      >
        {/* Theme Toggle Button */}
        <div className="flex flex-col items-center">
          <Tooltip
            title={lightTheme ? "Dark Mode" : "Light Mode"}
            placement="right"
          >
            <IconButton
              className="hover:bg-white/20 p-2 transition-all duration-300 hover:scale-110 mb-8"
              onClick={() => dispatch(toggleTheme())}
            >
              {lightTheme ? (
                <NightlightIcon className="text-white text-3xl" />
              ) : (
                <SunnyIcon className="text-white text-3xl" />
              )}
            </IconButton>
          </Tooltip>

          {/* Top Navigation Icons */}
          <div className="flex flex-col items-center space-y-6">
            {navigationItems.map((item, index) => (
              <Tooltip key={index} title={item.label} placement="right">
                <IconButton
                  className={`hover:bg-white/20 p-2 transition-all duration-300 hover:scale-110 ${
                    location.pathname.includes(item.label.toLowerCase())
                      ? "bg-white/30 shadow-md"
                      : ""
                  }`}
                  onClick={item.action}
                >
                  {item.badge ? (
                    <Badge badgeContent={item.badge} color="error">
                      {item.icon}
                    </Badge>
                  ) : (
                    item.icon
                  )}
                </IconButton>
              </Tooltip>
            ))}
          </div>
        </div>

        {/* Bottom Navigation Icons */}
        <div className="flex flex-col items-center space-y-6 pb-3">
          {bottomNavigationItems.map((item, index) => (
            <Tooltip key={index} title={item.label} placement="right">
              <IconButton
                className={`hover:bg-white/20 p-2 transition-all duration-300 hover:scale-110 ${
                  location.pathname.includes(item.label.toLowerCase())
                    ? "bg-white/30 shadow-md"
                    : ""
                }`}
                onClick={item.action}
              >
                {item.icon}
              </IconButton>
            </Tooltip>
          ))}
        </div>
      </div>

      {/* Chat List and Search Panel */}
      <div
        className={`w-full rounded-tl-3xl px-5 pt-5 lg:w-[30vw] ${
          lightTheme ? "bg-gray-100" : "!bg-[#181C14]"
        } transition-all duration-300`}
      >
        {/* Search Header with Title */}
        <div className="flex justify-between items-center mb-4">
          <h2
            className={`text-xl font-semibold ${
              lightTheme ? "text-gray-800" : "text-gray-200"
            }`}
          >
            Messages
          </h2>
          <span
            className={`text-sm ${
              lightTheme ? "text-blue-600" : "text-blue-400"
            }`}
          >
            {chatList.length}{" "}
            {chatList.length === 1 ? "conversation" : "conversations"}
          </span>
        </div>

        {/* Enhanced Search Bar */}
        <div
          className={`flex items-center rounded-full shadow-md px-4 py-3 transition-all duration-300 ${
            isSearchFocused ? "ring-2 ring-opacity-50" : ""
          } ${
            lightTheme
              ? `bg-white hover:shadow-lg ${
                  isSearchFocused ? "ring-blue-400" : ""
                }`
              : `bg-[#2A2D27] hover:shadow-lg border border-gray-700 ${
                  isSearchFocused ? "ring-blue-600" : ""
                }`
          }`}
        >
          <SearchIcon
            className={`${lightTheme ? "text-gray-500" : "text-gray-400"} ${
              isSearchFocused
                ? lightTheme
                  ? "text-blue-500"
                  : "text-blue-400"
                : ""
            }`}
          />
          <input
            type="text"
            placeholder="Search contacts"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className={`w-full px-3 outline-none text-lg ${
              lightTheme ? "text-gray-800" : "text-white placeholder-gray-400"
            } bg-transparent`}
          />
          {search && (
            <IconButton size="small" onClick={clearSearch}>
              <CloseIcon
                className={lightTheme ? "text-gray-500" : "text-gray-400"}
                fontSize="small"
              />
            </IconButton>
          )}
        </div>

        {/* Chat List Container */}
        <div
          className={`mt-4 rounded-2xl shadow-lg h-[calc(100%-130px)] max-h-[82vh] overflow-hidden ${
            lightTheme ? "bg-white" : "!bg-[#3C3D37]"
          } transition-all duration-300`}
        >
          {/* Search Results or Chat List */}
          <div className="flex flex-col gap-y-3 px-4 py-4 overflow-y-auto h-full no-scrollbar">
            {data.length > 0 && (
              <div
                className={`px-2 py-1 mb-2 text-sm font-medium ${
                  lightTheme ? "text-gray-500" : "text-gray-300"
                }`}
              >
                Search Results ({data.length})
              </div>
            )}

            {search.trim() !== "" && (
              <div className="flex flex-col gap-2">
                {isSearching ? (
                  <div className="flex items-center justify-center py-4">
                    <CircularProgress size={24} className="text-blue-500" />
                    <span className="ml-2 text-gray-500">Searching...</span>
                  </div>
                ) : searchError ? (
                  <div className="text-center py-4 text-red-500 bg-red-50 rounded-lg">
                    {searchError}
                  </div>
                ) : data.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    No users found matching "{search}"
                  </div>
                ) : (
                  data.map((user) => (
                    <div
                      key={user._id}
                      onClick={() => {
                        clearSearch();
                        navigate(`/app/chat/${user._id}`);
                        addUserToChatList(user._id);
                      }}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-300 hover:bg-gray-100 ${
                        lightTheme ? "hover:bg-gray-100" : "hover:bg-gray-800"
                      }`}
                    >
                      <Avatar
                        src={user.pic}
                        alt={user.name}
                        sx={{
                          width: 40,
                          height: 40,
                          border: `2px solid ${
                            onlineUsers.includes(user._id)
                              ? "#10B981"
                              : lightTheme
                              ? "#e5e7eb"
                              : "#4b5563"
                          }`,
                        }}
                      />
                      <div className="flex flex-col">
                        <span
                          className={`font-medium ${
                            lightTheme ? "text-gray-800" : "text-white"
                          }`}
                        >
                          {user.name}
                        </span>
                        <span
                          className={`text-sm ${
                            lightTheme ? "text-gray-500" : "text-gray-400"
                          }`}
                        >
                          @{user.username}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {search.trim() === "" && (
              <>
                {chatList.length > 0 ? (
                  <>
                    <div
                      className={`px-2 py-1 mb-2 text-sm font-medium ${
                        lightTheme ? "text-gray-500" : "text-gray-300"
                      }`}
                    >
                      Recent Chats
                    </div>
                    <div className="flex flex-col gap-y-3 px-4 py-3">
                      {chatList.map((item, index) => (
                        <div
                          key={index}
                          onClick={() => {
                            navigate(`/app/chat/${item._id}`);
                          }}
                          className={`flex items-center justify-between gap-4 p-4 rounded-xl cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md hover:scale-[1.02] ${
                            lightTheme
                              ? "bg-white hover:bg-gray-100"
                              : "bg-[#1E1E1E] hover:!bg-[#2A2D27]"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <Avatar
                                alt={item.name}
                                src={item.pic}
                                sx={{
                                  width: 50,
                                  height: 50,
                                  border: `2px solid ${
                                    lightTheme ? "#e5e7eb" : "#4b5563"
                                  }`,
                                }}
                              />
                              <span
                                className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full ${
                                  onlineUsers.includes(item._id)
                                    ? "bg-green-400"
                                    : "bg-gray-400"
                                } border-2 ${
                                  lightTheme
                                    ? "border-white"
                                    : "border-[#1E1E1E]"
                                }`}
                              ></span>
                            </div>
                            <div>
                              <h1
                                className={`text-base font-semibold ${
                                  lightTheme ? "text-gray-800" : "text-white"
                                }`}
                              >
                                {item.name}
                              </h1>
                              <p
                                className={`text-xs ${
                                  onlineUsers.includes(item._id)
                                    ? lightTheme
                                      ? "text-green-600"
                                      : "text-green-400"
                                    : lightTheme
                                    ? "text-gray-500"
                                    : "text-gray-400"
                                }`}
                              >
                                {onlineUsers.includes(item._id)
                                  ? "Online"
                                  : "Offline"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-10 text-center">
                    <Avatar
                      className={`mb-4 ${
                        lightTheme
                          ? "bg-blue-100 text-blue-500"
                          : "bg-gray-700 text-gray-300"
                      }`}
                      sx={{ width: 60, height: 60 }}
                    >
                      <ChatIcon fontSize="large" />
                    </Avatar>
                    <div
                      className={`text-lg font-medium ${
                        lightTheme ? "text-gray-700" : "text-gray-300"
                      }`}
                    >
                      No chats available
                    </div>
                    <p
                      className={`text-sm mt-2 ${
                        lightTheme ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      Search for users to start a conversation
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SideNavChatList;
