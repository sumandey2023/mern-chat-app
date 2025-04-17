import React from "react";
import { useSelector } from "react-redux";

const MessageSelf = ({ text, time }) => {
  const lightTheme = useSelector((state) => state.themeKey);

  return (
    <div className="flex justify-end mb-2 pr-2">
      <div
        className={`px-4 py-2 pb-5 max-w-[75%] rounded-2xl shadow-md relative ${
          lightTheme ? "bg-blue-500 text-white" : "bg-blue-600 text-white"
        }`}
      >
        {/* Message text */}
        <p className="text-sm lg:text-base">{text}</p>

        {/* Time - bottom right corner, spaced from text */}
        <span className="absolute bottom-1 right-2 text-[10px] text-white/70">
          {time}
        </span>
      </div>
    </div>
  );
};

export default MessageSelf;
