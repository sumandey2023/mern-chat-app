import React, { useEffect, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Lottie from "lottie-react";
import api from "../../config/axios";
import { Avatar } from "@mui/material";

const dummyData = [
  { name: "John Doe", lastMessage: "Hey! How are you?", time: "10:30 AM" },
  { name: "Jane Smith", lastMessage: "Let's catch up later!", time: "9:15 AM" },
  { name: "Alice Johnson", lastMessage: "Meeting at 3 PM?", time: "Yesterday" },
  { name: "Bob Brown", lastMessage: "Sounds great!", time: "Monday" },
  { name: "Charlie Davis", lastMessage: "See you soon!", time: "Sunday" },
  { name: "John Doe", lastMessage: "Hey! How are you?", time: "10:30 AM" },
  { name: "Jane Smith", lastMessage: "Let's catch up later!", time: "9:15 AM" },
  { name: "Alice Johnson", lastMessage: "Meeting at 3 PM?", time: "Yesterday" },
  { name: "Bob Brown", lastMessage: "Sounds great!", time: "Monday" },
  { name: "Charlie Davis", lastMessage: "See you soon!", time: "Sunday" },
];

const Chats = ({ data = dummyData }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [spinnerData, setSpinnerData] = useState(null);
  const lightTheme = useSelector((state) => state.themeKey);
  const navigate = useNavigate();

  useEffect(() => {
    const loadSpinner = async () => {
      try {
        const response = await fetch("/spinner.json");
        const data = await response.json();
        setSpinnerData(data);
      } catch (error) {
        console.error("Error loading spinner:", error);
      }
    };
    loadSpinner();
  }, []);

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/user/fetchAllUsers", {
          withCredentials: true,
        });
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllUsers();
  }, []);

  useEffect(() => {
    console.log("Users state updated:", users);
  }, [users]);

  return (
    <div
      className={`bg-gray-100 lg:block grow h-full py-4 px-3 ${
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
          Chats
        </h1>

        {users.length ? (
          <div
            className={`rounded-2xl flex-1 overflow-y-auto no-scrollbar transition-colors duration-300 ${
              lightTheme ? "bg-white" : "bg-[#3C3D37]"
            }`}
            style={{ maxHeight: "78vh" }}
          >
            <div className="flex flex-col gap-y-3 px-4 py-3">
              {users.map((item, index) => (
                <div
                  key={index}
                  onClick={() => navigate(`/app/chat`)}
                  className={`flex items-center justify-between gap-4 p-4 rounded-xl cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md hover:scale-[1.02] ${
                    lightTheme
                      ? "bg-white hover:bg-gray-100"
                      : "bg-[#1E1E1E] hover:!bg-[#2A2D27]"
                  }`}
                >
                  {/* Avatar & Info */}
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
        ) : (
          <div
            className={`flex flex-col h-[calc(100vh-10vh)] rounded-2xl  overflow-hidden items-center justify-center p-6 ${
              lightTheme ? "bg-white" : "bg-[#3C3D37]"
            }`}
          >
            <h1
              className={`text-2xl md:text-4xl font-extrabold ${
                lightTheme ? "text-gray-800" : "text-white"
              }`}
            >
              Welcome to Adda!🎉
            </h1>
            <p
              className={`mt-2 text-sm md:text-lg text-center max-w-md ${
                lightTheme ? "text-gray-600" : "text-gray-300"
              }`}
            >
              Connect with friends and have amazing conversations in a fun and
              interactive space.
            </p>
            <p
              className={`mt-6 font-semibold text-sm md:text-lg ${
                lightTheme ? "text-blue-500" : "text-blue-400"
              }`}
            >
              Start Chatting
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chats;
