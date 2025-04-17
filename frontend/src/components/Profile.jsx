import React, { useEffect, useState } from "react";
import { TextField, Button, Avatar, Paper } from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import LogoutIcon from "@mui/icons-material/Logout";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import defaultProfile from "../assets/profile.webp";
import toast, { Toaster } from "react-hot-toast";
import api from "../../config/axios";

const Profile = () => {
  const lightTheme = useSelector((state) => state.themeKey);
  const [userData, setUserData] = useState({});
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({
    name: "",
    profilePic: defaultProfile,
  });

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data } = await api.get("/user/get-user-details", {
          withCredentials: true,
        });
        setUserData(data);
        setProfileData((prev) => ({
          ...prev,
          name: data.user?.name || "",
        }));
      } catch (error) {
        console.log(error);
      }
    };
    getUser();
  }, []);

  const [uploadedImage, setUploadedImage] = useState(null); // NEW

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageURL = URL.createObjectURL(file);
      setUploadedImage(imageURL); // set the uploaded image
      setProfileData({ ...profileData, profilePic: imageURL });
    }
  };

  const handleInputChange = (e) => {
    setProfileData({ ...profileData, name: e.target.value });
  };

  const handleSave = () => {
    alert("Name Updated: " + profileData.name);
    // Here you can send updated name to backend
  };

  const handleLogout = async () => {
    try {
      const loadingToast = toast.loading("Logging out...");

      await api.post(
        "/user/logout",
        {},
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      localStorage.clear();
      toast.dismiss(loadingToast);
      toast.success("Logged out successfully!");

      setTimeout(() => {
        navigate("/", { state: { toastMessage: "Logged out successfully!" } });
      }, 500);
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  return (
    <div
      className={`grow py-4 px-3 h-full flex justify-center items-center ${
        lightTheme ? "bg-gray-100 text-black" : "bg-[#181C14] text-white"
      }`}
    >
      <Toaster position="top-right" />
      <Paper
        elevation={6}
        className={`p-8 rounded-2xl max-w-md w-full text-center ${
          lightTheme ? "bg-white text-black" : "!bg-[#2A2A2A] text-white"
        }`}
      >
        {/* Profile Picture Upload */}
        <div className="flex flex-col items-center mb-6">
          <div
            className="relative w-24 h-24"
            // onClick={() => {
            //   <ShowProfilePic pic={userData.user.pic} />;
            // }}
          >
            <input
              type="file"
              accept="image/*"
              className="hidden"
              id="profile-upload"
              onChange={handleImageChange}
            />
            {/* <Avatar
              alt="Profile"
              src={userData.user?.pic || profileData.pic}
              sx={{
                width: 96,
                height: 96,
                border: `2px solid ${lightTheme ? "gray" : "white"}`,
              }}
            /> */}

            <Avatar
              alt="Profile"
              src={uploadedImage || userData.user?.pic || defaultProfile}
              sx={{
                width: 96,
                height: 96,
                border: `2px solid ${lightTheme ? "gray" : "white"}`,
              }}
            />

            <label
              htmlFor="profile-upload"
              className="absolute bottom-1 right-1 bg-gray-200 p-2 rounded-full cursor-pointer shadow-md"
            >
              <PhotoCameraIcon fontSize="small" />
            </label>
          </div>
        </div>

        {/* Name (Editable) */}
        <TextField
          fullWidth
          label="Name"
          variant="outlined"
          margin="normal"
          value={profileData.name}
          onChange={handleInputChange}
          InputProps={{
            style: {
              backgroundColor: lightTheme ? "#ffffff" : "#3C3D37",
              color: lightTheme ? "#000" : "#fff",
            },
          }}
        />

        {/* Username (Read-only) */}
        <TextField
          fullWidth
          label="Username"
          variant="outlined"
          margin="normal"
          value={userData.user?.username || ""}
          InputProps={{
            readOnly: true,
            style: {
              backgroundColor: lightTheme ? "#f0f0f0" : "#2a2a2a",
              color: "#888",
            },
          }}
        />

        {/* Email (Read-only) */}
        <TextField
          fullWidth
          label="Email"
          variant="outlined"
          margin="normal"
          value={userData.user?.email || ""}
          InputProps={{
            readOnly: true,
            style: {
              backgroundColor: lightTheme ? "#f0f0f0" : "#2a2a2a",
              color: "#888",
            },
          }}
        />

        {/* Buttons */}
        <div className="mt-6 flex flex-col gap-4">
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{
              backgroundColor: lightTheme ? "#007bff" : "#0056b3",
              color: "white",
              textTransform: "none",
              "&:hover": {
                backgroundColor: lightTheme ? "#0056b3" : "#003580",
              },
            }}
            onClick={handleSave}
          >
            Save Changes
          </Button>
          <Button
            variant="contained"
            color="error"
            fullWidth
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
            sx={{
              backgroundColor: lightTheme ? "#dc3545" : "#b71c1c",
              textTransform: "none",
              "&:hover": {
                backgroundColor: lightTheme ? "#b71c1c" : "#7f0000",
              },
            }}
          >
            Logout
          </Button>
        </div>
      </Paper>
    </div>
  );
};

export default Profile;
