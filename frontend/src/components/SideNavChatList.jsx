import React, { useEffect, useState } from "react";
import NightlightIcon from "@mui/icons-material/Nightlight";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import PublicIcon from "@mui/icons-material/Public";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import GroupIcon from "@mui/icons-material/Group";
import PanoramaFishEyeIcon from "@mui/icons-material/PanoramaFishEye";
import VideocamIcon from "@mui/icons-material/Videocam";
import SettingsIcon from "@mui/icons-material/Settings";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ChatIcon from "@mui/icons-material/Chat";
import SearchIcon from "@mui/icons-material/Search";
import SunnyIcon from "@mui/icons-material/Sunny";
import { IconButton } from "@mui/material";
import ConversationsItem from "./ConversationItem";
import { useNavigate, useLocation } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../Features/theamSlice";
import BASE_URL from "../../config/api";
const SideNavChatList = () => {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const lightTheam = useSelector((state) => state.themeKey);
  const isSmallScreen = useMediaQuery({ maxWidth: 1150 });
  const isChatRoute = location.pathname.includes("/chat");
  const isCreateGroupRoute = location.pathname.includes("/create-group");

  // On mobile, if we're in a chat or create-group, don't show the chat list
  if (isSmallScreen && (isChatRoute || isCreateGroupRoute)) {
    return null;
  }

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/user/searchUsers?search=${search}`,
          {
            credentials: "include", // This will include cookies in the request
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) {
          if (res.status === 401) {
            // Handle unauthorized error
            console.error("User is not authenticated");
            setData([]);
            return;
          }
          throw new Error("Failed to fetch users");
        }
        const result = await res.json();
        setData(result);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        setData([]);
      }
    };

    const debounceTimer = setTimeout(() => {
      if (search.trim() !== "") {
        fetchUsers();
      } else {
        setData([]);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [search]);

  // Depend on `search` to trigger fetch when it changes

  return (
    <>
      <div
        className={`w-[65px] flex flex-col justify-between py-5 shadow-lg ${
          lightTheam ? "bg-[#4141FF]" : "!bg-[#2A2D27]"
        }`}
      >
        {/* side nav bar */}
        {/* Top Section - Navigation Icons */}
        <div className="flex flex-col items-center space-y-6">
          <IconButton
            className="hover:bg-white/10 p-2 transition-all duration-300 hover:scale-110"
            onClick={() => {
              dispatch(toggleTheme());
            }}
          >
            {lightTheam ? (
              <NightlightIcon className="text-white text-3xl" />
            ) : (
              <SunnyIcon className="text-white text-3xl" />
            )}
          </IconButton>

          <IconButton
            className="hover:bg-white/10 p-2 transition-all duration-300 hover:scale-110"
            onClick={() => {
              navigate("chats");
            }}
          >
            <ChatIcon className="text-white text-3xl" />
          </IconButton>

          <IconButton
            className="hover:bg-white/10 p-2 transition-all duration-300 hover:scale-110"
            onClick={() => {
              navigate("groups");
            }}
          >
            <GroupIcon className="text-white text-3xl" />
          </IconButton>
          <IconButton
            className="hover:bg-white/10 p-2 transition-all duration-300 hover:scale-110"
            onClick={() => {
              navigate("create-group");
            }}
          >
            <AddCircleOutlineIcon className="text-white text-3xl" />
          </IconButton>
          <IconButton
            className="hover:bg-white/10 p-2 transition-all duration-300 hover:scale-110"
            onClick={() => {
              navigate("ai-chat");
            }}
          >
            <PanoramaFishEyeIcon className="text-white text-3xl" />
          </IconButton>
          <IconButton className="hover:bg-white/10 p-2 transition-all duration-300 hover:scale-110">
            <VideocamIcon className="text-white text-3xl" />
          </IconButton>
        </div>

        {/* Bottom Section - Settings & Profile */}
        <div className="flex flex-col items-center space-y-6 pb-3">
          <IconButton
            className="hover:bg-white/10 p-2 transition-all duration-300 hover:scale-110"
            onClick={() => {
              navigate("public");
            }}
          >
            <PublicIcon className="text-white text-3xl" />
          </IconButton>
          <IconButton
            className="hover:bg-white/10 p-2 transition-all duration-300 hover:scale-110"
            onClick={() => {
              navigate("profile");
            }}
          >
            <AccountCircleIcon className="text-white text-3xl" />
          </IconButton>
        </div>
      </div>

      {/* Search Bar & Chat List */}
      <div
        className={`w-full rounded-tl-2xl px-4 pt-4 lg:w-[30vw] ${
          lightTheam ? "bg-gray-100" : "!bg-[#181C14]"
        }`}
      >
        {/* Search Bar */}
        <div
          className={`flex items-center rounded-full shadow-md px-4 py-2 transition-all duration-300 ${
            lightTheam
              ? "bg-white hover:shadow-lg"
              : "bg-[#2A2D27] hover:shadow-lg border border-gray-700"
          }`}
        >
          <SearchIcon
            className={lightTheam ? "text-gray-500" : "text-gray-400"}
          />
          <input
            type="text"
            placeholder="Search"
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full px-3 outline-none text-lg ${
              lightTheam ? "text-gray-800" : "text-white placeholder-gray-400"
            }`}
          />
        </div>

        {/* search users */}
        <div
          className={`mt-4 rounded-2xl shadow-lg h-[calc(100%-60px)] max-h-[82vh] overflow-hidden ${
            lightTheam ? "bg-white" : "!bg-[#3C3D37]"
          }`}
        >
          <div className="flex flex-col gap-y-3 px-4 py-3 overflow-y-auto h-full no-scrollbar">
            {data.length ? (
              data.map((item, index) => (
                <ConversationsItem
                  key={index}
                  data={item}
                  lightTheam={lightTheam}
                />
              ))
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SideNavChatList;
