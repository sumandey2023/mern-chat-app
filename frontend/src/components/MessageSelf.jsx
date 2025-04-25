import React from "react";
import { useSelector } from "react-redux";

const MessageSelf = ({ text, time, status }) => {
  const lightTheme = useSelector((state) => state.themeKey);
  const lines = text.split("\n");

  // Define gradient based on theme
  const gradientStyle = lightTheme
    ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
    : "bg-gradient-to-br from-blue-600 to-blue-800 text-white";

  return (
    <div className="flex justify-end mb-3 pr-1 animate-fadeIn transition-all duration-300 ease-in-out group">
      {/* Message bubble with improved styling */}
      <div
        className={`px-3 py-2 pb-6 min-w-[120px] max-w-[75%] sm:max-w-[65%] rounded-t-xl rounded-bl-xl rounded-br-lg shadow-sm relative ${gradientStyle} transition-all duration-200 group-hover:shadow-md`}
      >
        {/* Message text with improved readability */}
        <div className="space-y-0.5">
          {lines.map((line, index) => (
            <p
              key={index}
              className="text-xs lg:text-sm leading-relaxed whitespace-pre-line"
            >
              {line || " "} {/* Handle empty lines */}
            </p>
          ))}
        </div>

        {/* Improved timestamp with status indicator */}
        <div className="absolute bottom-1 right-2.5 flex items-center gap-1">
          {status && (
            <span className="text-[9px] text-white/90">
              {status === "read" ? "✓✓" : "✓"}
            </span>
          )}
          <span className="text-[9px] font-medium text-white/80">{time}</span>
        </div>
      </div>
    </div>
  );
};

export default MessageSelf;
