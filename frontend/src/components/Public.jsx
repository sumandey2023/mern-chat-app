import React, { useEffect, useState } from "react";

import SearchIcon from "@mui/icons-material/Search";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Avatar } from "@mui/material";
const Public = () => {
  const lightTheme = useSelector((state) => state.themeKey);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:5000/user/fetchAllUsers",
          {
            withCredentials: true,
          }
        );
        setUsers(data);
        console.log("Fetched users:", data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchAllUsers();
    console.log(users);
  }, []);

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
                onClick={() => navigate(`/app/chat`)}
                className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                  lightTheme ? "" : "hover:!bg-[#2A2D27]"
                }`}
              >
                <Avatar
                  alt="Profile"
                  src={item?.pic}
                  sx={{
                    width: 65,
                    height: 65,
                    border: `2px solid ${lightTheme ? "white" : "white"}`,
                  }}
                />
                <div className="flex-1 min-w-0">
                  <h2
                    className={`text-lg font-semibold text-gray-800 truncate ${
                      lightTheme ? "" : "!text-white"
                    }`}
                  >
                    {item.name}
                  </h2>
                  <p
                    className={`text-sm text-gray-500 truncate ${
                      lightTheme ? "" : "!text-gray-400"
                    }`}
                  >
                    {item.lastMessage}
                  </p>
                </div>
                <span
                  className={`text-xs text-gray-400 whitespace-nowrap ${
                    lightTheme ? "" : "!text-gray-500"
                  }`}
                >
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Public;
