import React from "react";
import { useSelector } from "react-redux";

const MessageSelf = ({ text, time, isTemp }) => {
  const lightTheme = useSelector((state) => state.themeKey);

  return (
    <div className="flex justify-end mb-4">
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
          lightTheme ? "bg-blue-500 text-white" : "bg-blue-600 text-white"
        } relative group`}
      >
        <p className="text-sm">{text}</p>
        <div className="flex items-center justify-end mt-1">
          <span className="text-xs opacity-70">{time}</span>
          {isTemp && (
            <span className="ml-2 text-xs opacity-70">
              <span className="animate-pulse">Sending...</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageSelf;
