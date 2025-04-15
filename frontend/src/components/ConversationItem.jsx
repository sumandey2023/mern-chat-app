import { Avatar } from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const ConversationsItem = (props) => {
  const navigate = useNavigate();
  const lightTheme = useSelector((state) => state.themeKey);

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
        props.lightTheam ? "" : "hover:!bg-[#2A2D27]"
      }`}
      onClick={() => navigate(`chat/${props.data._id}`)}
    >
      <Avatar
        alt="Profile"
        src={props.data?.pic}
        sx={{
          width: 65,
          height: 65,
          border: `2px solid ${lightTheme ? "white" : "white"}`,
        }}
      />
      {/* Text Section */}
      <div className="flex-1 min-w-0">
        <h1
          className={`text-lg font-semibold text-gray-800 truncate ${
            props.lightTheam ? "" : "!text-white"
          }`}
        >
          {props.data.name}
        </h1>
        <p
          className={`text-sm text-gray-500 truncate ${
            props.lightTheam ? "" : "!text-gray-400"
          }`}
        >
          {props.data.message}
        </p>
      </div>
    </div>
  );
};

export default ConversationsItem;
