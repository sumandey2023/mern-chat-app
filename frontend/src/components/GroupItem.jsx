import { Avatar } from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const GroupItem = (props) => {
  const lightTheme = useSelector((state) => state.themeKey);
  const navigate = useNavigate();

  return (
    <div
      key={props.index}
      onClick={() => navigate(`/app/group/${props.item._id}`)}
      className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md hover:scale-[1.02] ${
        lightTheme
          ? "bg-white hover:bg-gray-100"
          : "bg-[#1E1E1E] hover:!bg-[#2A2D27]"
      }`}
    >
      {/* <div
        className={`w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center font-semibold text-xl shadow-md ${
          lightTheme ? "" : "border-2 border-[#444]"
        }`}
      >
        {props.item.groupName[0].toUpperCase()}
      </div> */}

      <Avatar
        src={props.item.pic || "/group.png"}
        sx={{ width: 60, height: 60 }}
      />

      {console.log(props.item)}
      <div className="flex-1 min-w-0">
        <h2
          className={`text-base font-semibold truncate ${
            lightTheme ? "text-gray-800" : "text-white"
          }`}
        >
          {props.item.groupName}
        </h2>
        <p
          className={`text-sm truncate max-w-full ${
            lightTheme ? "text-gray-500" : "text-gray-400"
          }`}
        >
          {props.item.groupDescription || "No description"}
        </p>
        {console.log(props.item)}
      </div>
      {props.item.members && (
        <span
          className={`text-xs whitespace-nowrap ${
            lightTheme ? "text-gray-400" : "text-gray-500"
          }`}
        >
          {props.item.members.length} members
        </span>
      )}
    </div>
  );
};

export default GroupItem;
