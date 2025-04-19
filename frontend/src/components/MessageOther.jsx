import { Avatar } from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";

const MessageOther = ({ text, avatar, time, pic }) => {
  const lightTheme = useSelector((state) => state.themeKey);
  const lines = text.split("\n");

  return (
    <div className="flex items-end gap-3 mb-3 pl-2 animate-fadeIn">
      {/* Avatar with hover effect */}
      <div className="transition-transform duration-200 hover:scale-105">
        {avatar ? (
          <div
            className={`w-[40px] h-[40px] lg:w-[50px] lg:h-[50px] rounded-full flex justify-center items-center text-white text-xl lg:text-2xl font-bold shadow-md ${
              lightTheme ? "bg-indigo-400" : "bg-indigo-600"
            }`}
          >
            {avatar}
          </div>
        ) : (
          <Avatar
            alt="Profile"
            src={pic}
            sx={{
              width: 50,
              height: 50,
              border: `2px solid ${lightTheme ? "#e5e7eb" : "#374151"}`,
              boxShadow:
                "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            }}
          />
        )}
      </div>

      {/* Message bubble with minimum width to prevent timestamp wrapping */}
      <div
        className={`px-4 py-3 pb-6 min-w-[120px] max-w-[75%] rounded-t-2xl rounded-br-2xl rounded-bl-lg shadow-md relative ${
          lightTheme
            ? "bg-white text-gray-800 border border-gray-100"
            : "bg-gray-800 text-gray-100 border border-gray-700"
        }`}
      >
        {lines.map((line, index) => (
          <p
            key={index}
            className="text-sm lg:text-base leading-relaxed whitespace-pre-line"
          >
            {line}
          </p>
        ))}

        {/* Improved timestamp with better positioning */}
        <span
          className={`absolute bottom-1 right-2.5 text-[10px] font-medium ${
            lightTheme ? "text-gray-400" : "text-gray-500"
          }`}
        >
          {time}
        </span>
      </div>
    </div>
  );
};

export default MessageOther;
