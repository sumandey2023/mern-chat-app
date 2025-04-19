import React from "react";
import { useSelector } from "react-redux";

const MessageSelf = ({ text, time }) => {
  const lightTheme = useSelector((state) => state.themeKey);
  const lines = text.split("\n");

  return (
    <div className="flex justify-end mb-3 pr-2 animate-fadeIn">
      <div
        className={`px-4 py-3 pb-6 min-w-[120px] max-w-[75%] rounded-t-2xl rounded-bl-2xl rounded-br-lg shadow-md relative ${
          lightTheme
            ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
            : "bg-gradient-to-br from-blue-600 to-blue-700 text-white"
        } shadow-lg`}
      >
        {/* Message text with support for line breaks */}
        {lines.map((line, index) => (
          <p
            key={index}
            className="text-sm lg:text-base leading-relaxed whitespace-pre-line"
          >
            {line}
          </p>
        ))}

        {/* Time - improved position and styling */}
        <span className="absolute bottom-1 right-2.5 text-[10px] font-medium text-white/80">
          {time}
        </span>
      </div>
    </div>
  );
};

export default MessageSelf;
