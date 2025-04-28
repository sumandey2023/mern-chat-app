import React, { useEffect, useState } from "react";

import SearchIcon from "@mui/icons-material/Search";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Avatar } from "@mui/material";
import api from "../../config/axios";
const Public = () => {
  const lightTheme = useSelector((state) => state.themeKey);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const { data } = await api.get("/user/fetchAllUsers", {
          withCredentials: true,
        });
        setUsers(data);
        console.log("Fetched users:", data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchAllUsers();
  }, []);

  const addUserToChatLIst = async (userId) => {
    try {
      const res = await api.post(
        "/user/add-to-chat-list",
        { userId },
        { withCredentials: true }
      );
      if (res.status === 200) {
        console.log("User added to chat list successfully");
        // Refresh the user list after successful addition
        fetchAllUsers();
      } else {
        console.error("Failed to add user to chat list");
      }
    } catch (error) {
      console.error("Error adding user to chat list:", error);
    }
  };
  return (
    <div
      className={`bg-gray-100 h-full lg:block grow py-4 px-3 ${
        lightTheme ? "" : "!bg-[#181C14]"
      }`}
    >
      <div
        className={`flex flex-col h-[calc(100vh-10vh)] bg-white rounded-2xl shadow-lg overflow-hidden p-4 ${
          lightTheme ? "" : "!bg-[#3C3D37]"
        }`}
      >
        {/* Heading */}
        <h1
          className={`text-2xl font-bold text-blue-500 pl-4 mb-4 ${
            lightTheme ? "" : "!text-blue-400"
          }`}
        >
          All Users
        </h1>
        {console.log(
          `${window.location.origin}/app/chat/68037bf45bafea071663b904`
        )}
        <div
          className={`bg-white rounded-2xl flex-1 overflow-y-auto no-scrollbar ${
            lightTheme ? "" : "!bg-[#3C3D37]"
          }`}
          style={{ maxHeight: "78vh" }}
        >
          <div className="flex flex-col gap-y-3 px-4 py-3">
            {users.map((item, index) => (
              <div
                key={index}
                onClick={async () => {
                  await addUserToChatLIst(item._id);
                  navigate(`/app/chat/${item._id}`);
                }}
                className={`flex items-center justify-between gap-4 p-4 rounded-xl cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md hover:scale-[1.02] ${
                  lightTheme
                    ? "bg-white hover:bg-gray-100"
                    : "bg-[#1E1E1E] hover:!bg-[#2A2D27]"
                }`}
              >
                {/* Avatar and Name + Last Message */}
                <div className="flex items-center gap-4 min-w-0">
                  <Avatar
                    alt="Profile"
                    src={item?.pic}
                    sx={{
                      width: 60,
                      height: 60,
                      border: `2px solid ${lightTheme ? "#e0e0e0" : "#444"}`,
                    }}
                  />
                  <div className="flex flex-col overflow-hidden">
                    <h2
                      className={`text-base font-semibold truncate ${
                        lightTheme ? "text-gray-800" : "text-white"
                      }`}
                    >
                      {item.name}
                    </h2>
                    <p
                      className={`text-sm truncate ${
                        lightTheme ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      @{item.username}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Public;
