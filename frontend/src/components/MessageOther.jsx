import React from "react";
import { useSelector } from "react-redux";

const MessageOther = ({ text, avatar }) => {
  const lightTheme = useSelector((state) => state.themeKey);

  // Split message by newline character
  const lines = text.split("\n");

  return (
    <div className="flex items-start gap-3 mb-4">
      {/* Avatar */}
      <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex justify-center items-center text-white text-base lg:text-lg font-semibold shadow-md">
        {avatar || "AI"}
      </div>

      {/* Message Bubble */}
      <div
        className={`rounded-2xl px-4 py-3 max-w-[80%] lg:max-w-[65%] shadow-md transition-all duration-300 ${
          lightTheme
            ? "bg-gray-100 text-gray-900 hover:shadow-lg"
            : "bg-[#2A2D27] text-white hover:shadow-lg"
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
      </div>
    </div>
  );
};

export default MessageOther;
