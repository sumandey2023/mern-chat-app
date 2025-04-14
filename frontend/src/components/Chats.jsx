import React, { useEffect, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Lottie from "lottie-react";
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

        {/* Search Bar */}
        {/* <div
          className={`flex items-center rounded-full shadow-md px-4 py-2 mb-4 transition-all duration-300 ${
            lightTheme
              ? "bg-white hover:shadow-lg"
              : "bg-[#2A2D27] hover:shadow-lg border border-gray-700"
          }`}
        >
          <SearchIcon
            className={`text-gray-500 ${lightTheme ? "" : "!text-gray-400"}`}
          />
          <input
            type="text"
            placeholder="Search chats..."
            className={`w-full px-3 outline-none bg-transparent text-lg ${
              lightTheme ? "" : "!text-white placeholder-gray-400"
            }`}
          />
        </div> */}

        {/* Chat List with Scroll */}

        {users.length ? (
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
                  <div
                    className={`w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-2xl shadow-md ${
                      lightTheme ? "" : "!from-blue-600 !to-blue-700"
                    }`}
                  >
                    {/* {item.name[0]} */}

                    <Avatar
                      alt="Profile"
                      src={item?.pic}
                      sx={{
                        width: 65,
                        height: 65,
                        border: `2px solid ${lightTheme ? "" : "white"}`,
                      }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h2
                      className={`text-lg font-semibold text-gray-800 ml-2 truncate ${
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
