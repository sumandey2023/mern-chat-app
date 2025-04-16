import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { useSelector } from "react-redux";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import api from "../../config/axios";

const Welcome = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const lightTheam = useSelector((state) => state.themeKey);
  const [userData, setUserData] = useState({});
  const [logInMessage, setLogInMessage] = useState(
    location.state?.toastMessage
  );

  useEffect(() => {
    if (logInMessage) {
      toast.success(logInMessage, {
        position: "top-right",
        autoClose: 3000,
      });

      // Remove the message from location state
      navigate(location.pathname, { replace: true });
    }
  }, [logInMessage, navigate, location.pathname]);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data } = await api.get("/user/get-user-details", {
          withCredentials: true,
        });
        setUserData(data);
      } catch (error) {
        console.log(error);
      }
    };
    getUser();
  }, []);

  return (
    <div
      className={`grow py-4 px-3 h-full ${
        lightTheam ? "bg-gray-100" : "bg-[#181C14]"
      }`}
    >
      <div
        className={`flex flex-col h-[calc(100vh-10vh)] rounded-2xl shadow-lg overflow-hidden items-center justify-center p-6 ${
          lightTheam ? "bg-white" : "bg-[#3C3D37]"
        }`}
      >
        <h1
          className={`text-2xl md:text-4xl font-extrabold ${
            lightTheam ? "text-gray-800" : "text-white"
          }`}
        >
          Welcome {userData.user?.name || "Guest"} to Adda!🎉
        </h1>
        <p
          className={`mt-2 text-sm md:text-lg text-center max-w-md ${
            lightTheam ? "text-gray-600" : "text-gray-300"
          }`}
        >
          Connect with friends and have amazing conversations in a fun and
          interactive space.
        </p>
        <p
          className={`mt-6 font-semibold text-sm md:text-lg ${
            lightTheam ? "text-blue-500" : "text-blue-400"
          }`}
        >
          Start Chatting
        </p>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Welcome;
