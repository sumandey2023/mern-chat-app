import React from "react";
import { useSelector } from "react-redux";

const MessageSelf = ({ text }) => {
  const lightTheme = useSelector((state) => state.themeKey);

  return (
    <div className="flex items-start justify-end gap-3 mb-4">
      {/* Message Bubble */}
      <div className="rounded-2xl px-4 py-3 max-w-[80%] lg:max-w-[65%] bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md transition-all duration-300 hover:shadow-lg">
        <p className="text-sm lg:text-base leading-relaxed">{text}</p>
      </div>
    </div>
  );
};

export default MessageSelf;
