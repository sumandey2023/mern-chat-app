import { Avatar } from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";

const MessageOtherGroup = ({ text, avatar, time, pic, senderName, status }) => {
  const lightTheme = useSelector((state) => state.themeKey);
  const lines = text.split("\n");

  // Dynamic styling based on theme
  const bubbleStyle = lightTheme
    ? "bg-white text-gray-800 border border-gray-100"
    : "bg-gray-700 text-gray-100 border border-gray-700";

  const nameStyle = lightTheme ? "text-indigo-600" : "text-indigo-300";

  const timeStyle = lightTheme ? "text-gray-400" : "text-gray-400";

  const avatarBgStyle = lightTheme ? "bg-indigo-500" : "bg-indigo-600";

  return (
    <div className="flex items-end gap-2 mb-3 pl-1 animate-fadeIn transition-all duration-300 ease-in-out group">
      {/* Avatar with more compact size */}
      <div className="transition-transform duration-300 ease-in-out group-hover:scale-105">
        {avatar ? (
          <div
            className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex justify-center items-center text-white text-lg lg:text-xl font-bold shadow-md ${avatarBgStyle}`}
          >
            {avatar}
          </div>
        ) : (
          <Avatar
            alt={senderName || "Profile"}
            src={pic}
            sx={{
              width: { xs: 32, lg: 40 },
              height: { xs: 32, lg: 40 },
              border: `2px solid ${lightTheme ? "#e5e7eb" : "#374151"}`,
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              transition: "all 0.3s ease",
            }}
          />
        )}
      </div>

      {/* Message bubble with more compact styling */}
      <div
        className={`px-3 py-2 pb-6 min-w-[120px] max-w-[75%] sm:max-w-[65%] rounded-t-xl rounded-br-xl rounded-bl-lg shadow-sm relative ${bubbleStyle} transition-all duration-200`}
      >
        {/* Smaller sender name */}
        {senderName && (
          <span className={`text-xs font-medium mb-1 block ${nameStyle}`}>
            {senderName}
          </span>
        )}

        {/* Message text with slightly smaller text */}
        <div className="space-y-0.5">
          {lines.map((line, index) => (
            <p
              key={index}
              className="text-xs lg:text-sm leading-relaxed whitespace-pre-line"
            >
              {line || " "}
            </p>
          ))}
        </div>

        {/* Smaller timestamp */}
        <div className="absolute bottom-1 right-2.5 flex items-center gap-1">
          {status && (
            <span
              className={`text-[9px] ${
                status === "read" ? "text-blue-500" : timeStyle
              }`}
            >
              {status === "read" ? "✓✓" : "✓"}
            </span>
          )}
          <span className={`text-[9px] font-medium ${timeStyle}`}>{time}</span>
        </div>
      </div>
    </div>
  );
};

export default MessageOtherGroup;
