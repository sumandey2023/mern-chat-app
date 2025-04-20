import { Avatar, Badge } from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

const ConversationsItem = (props) => {
  const lightTheme = useSelector((state) => state.themeKey);

  // Check if the user is online using the onlineUsers prop passed from parent
  const isOnline =
    props.onlineUsers && props.onlineUsers.includes(props.data?._id);

  return (
    <div
      className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all duration-300 ${
        props.lightTheam
          ? "bg-white hover:bg-blue-50 hover:shadow-md"
          : "bg-[#2A2D27] hover:!bg-[#3C3F37] hover:shadow-md"
      }`}
      onClick={props.onSelect}
    >
      {/* Avatar with Online Indicator */}
      <div className="relative">
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          badgeContent={
            <FiberManualRecordIcon
              className={`${isOnline ? "text-green-500" : "text-gray-400"} ${
                props.lightTheam ? "bg-white" : "bg-[#2A2D27]"
              }`}
              style={{ fontSize: "12px", borderRadius: "50%" }}
            />
          }
        >
          <Avatar
            alt={props.data?.name || "User"}
            src={props.data?.pic}
            sx={{
              width: 48,
              height: 48,
              bgcolor: props.lightTheam ? "#4141FF" : "#3C3D37",
              border: `2px solid ${props.lightTheam ? "#e0e0e0" : "#444"}`,
            }}
          >
            {!props.data?.pic && <PersonIcon className="text-white" />}
          </Avatar>
        </Badge>
      </div>

      {/* Text Section */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex justify-between items-center">
          <h1
            className={`text-base font-medium truncate ${
              props.lightTheam ? "text-gray-800" : "text-white"
            }`}
          >
            {props.data.name}
          </h1>

          {/* Time indicator - Replace with actual timestamp data */}
          <span
            className={`text-xs ${
              props.lightTheam ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {new Date().getHours() +
              ":" +
              (new Date().getMinutes() < 10 ? "0" : "") +
              new Date().getMinutes()}
          </span>
        </div>

        <div className="flex justify-between items-center mt-1">
          <p
            className={`text-sm truncate ${
              props.lightTheam ? "text-gray-500" : "text-gray-400"
            }`}
          >
            @{props.data.username}
          </p>

          {/* Add unread message counter if needed */}
          {props.data._id % 3 === 0 && (
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                props.lightTheam
                  ? "bg-blue-500 text-white"
                  : "bg-blue-600 text-white"
              }`}
            >
              2
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationsItem;
