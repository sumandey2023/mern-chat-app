import React, { useEffect, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../config/axios";

const Groups = () => {
  const location = useLocation();
  const [data, setData] = useState([]);
  const lightTheme = useSelector((state) => state.themeKey);
  const navigate = useNavigate();

  const handleCreateGroup = () => {
    navigate("/app/create-group");
  };

  useEffect(() => {
    if (location.state?.createGroupMessage) {
      toast.success(location.state.createGroupMessage);
      // Clear the state to prevent showing toast on page refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  useEffect(() => {
    try {
      const fetchGroups = async () => {
        const { data } = await api.get("/group/getGroups", {
          withCredentials: true,
        });
        setData(data);
      };
      fetchGroups();
    } catch (error) {
      console.log(error);
    }
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
        {/* Header with Create Group Button */}
        <div className="flex justify-between items-center mb-4">
          <h1
            className={`text-2xl font-bold text-blue-500 pl-2 ${
              lightTheme ? "" : "!text-blue-400"
            }`}
          >
            Groups
          </h1>
          <button
            onClick={handleCreateGroup}
            className={`flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-all duration-300 shadow-md ${
              lightTheme ? "" : "!bg-blue-600 hover:!bg-blue-700"
            }`}
          >
            <AddCircleIcon fontSize="small" />
            <span className="font-medium">New Group</span>
          </button>
        </div>

        {/* Group List */}
        {data.length ? (
          <div
            className={`bg-white rounded-2xl flex-1 overflow-y-auto no-scrollbar ${
              lightTheme ? "" : "!bg-[#3C3D37]"
            }`}
            style={{ maxHeight: "78vh" }}
          >
            <div className="flex flex-col gap-y-3 px-2 py-3">
              {data.map((item, index) => (
                <div
                  key={index}
                  onClick={() => navigate(`/app/group`)}
                  className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                    lightTheme ? "hover:bg-gray-100" : "hover:!bg-[#2A2D27]"
                  }`}
                >
                  <div
                    className={`w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-2xl shadow-md ${
                      lightTheme ? "" : "!from-blue-600 !to-blue-700"
                    }`}
                  >
                    {item.groupName[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2
                      className={`text-lg font-semibold text-gray-800 truncate ${
                        lightTheme ? "" : "!text-white"
                      }`}
                    >
                      {item.groupName}
                    </h2>
                    <p
                      className={`text-sm text-gray-500 truncate ${
                        lightTheme ? "" : "!text-gray-400"
                      }`}
                    ></p>
                  </div>
                  <span
                    className={`text-xs text-gray-400 whitespace-nowrap ${
                      lightTheme ? "" : "!text-gray-500"
                    }`}
                  ></span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div
            className={`flex flex-col grow items-center justify-center p-6 rounded-xl ${
              lightTheme ? "bg-gray-50" : "bg-[#2A2D27]"
            }`}
          >
            <div className="w-24 h-24 mb-6 bg-blue-100 rounded-full flex items-center justify-center">
              <AddCircleIcon
                style={{ fontSize: 48 }}
                className={`text-blue-500 ${
                  lightTheme ? "" : "!text-blue-400"
                }`}
              />
            </div>
            <h1
              className={`text-2xl md:text-3xl font-bold mb-3 ${
                lightTheme ? "text-gray-800" : "text-white"
              }`}
            >
              Welcome to Adda!
            </h1>
            <p
              className={`mt-2 text-sm md:text-base text-center max-w-md mb-6 ${
                lightTheme ? "text-gray-600" : "text-gray-300"
              }`}
            >
              Connect with friends and have amazing conversations in a fun and
              interactive space.
            </p>
            <button
              onClick={handleCreateGroup}
              className={`flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-300 shadow-lg ${
                lightTheme ? "" : "!bg-blue-600 hover:!bg-blue-700"
              }`}
            >
              <AddCircleIcon fontSize="small" />
              <span className="font-medium">Create Your First Group</span>
            </button>
          </div>
        )}
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
};

export default Groups;
