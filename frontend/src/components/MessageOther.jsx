import { Avatar } from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";

const MessageOther = ({ text, avatar, time, pic }) => {
  const lightTheme = useSelector((state) => state.themeKey);
  const lines = text.split("\n");

  return (
    <div className="flex items-end gap-3 mb-2 pl-2">
      {/* Avatar - slightly larger now */}
      <Avatar
        alt="Profile"
        src={pic}
        sx={{
          width: 65,
          height: 65,
          border: `2px solid white`,
        }}
      />

      {/* Message bubble */}
      <div
        className={`px-4 py-2 pb-5 max-w-[75%] rounded-2xl shadow-md relative ${
          lightTheme ? "bg-gray-100 text-gray-900" : "bg-[#2A2D27] text-white"
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

        {/* Timestamp */}
        <span className="absolute bottom-1 right-2 text-[10px] text-gray-500 dark:text-gray-400">
          {time}
        </span>
      </div>
    </div>
  );
};

export default MessageOther;
