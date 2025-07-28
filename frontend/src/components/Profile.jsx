import React, { useEffect, useState } from "react";
import {
  TextField,
  Button,
  Avatar,
  Paper,
  Typography,
  Box,
  Divider,
  InputAdornment,
} from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import LogoutIcon from "@mui/icons-material/Logout";
import SaveIcon from "@mui/icons-material/Save";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import EmailIcon from "@mui/icons-material/Email";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import defaultProfile from "../assets/profile.webp";
import toast, { Toaster } from "react-hot-toast";
import api from "../config/api";

const Profile = () => {
  const lightTheme = useSelector((state) => state.themeKey);
  const [userData, setUserData] = useState({});
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({
    name: "",
    profilePic: defaultProfile,
  });
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imageFile, setImageFile] = useState(null); // store actual file

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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageURL = URL.createObjectURL(file);
      setUploadedImage(imageURL);
      setProfileData({ ...profileData, profilePic: imageURL });
      setImageFile(file); // set file to send to backend
    }
  };

  const handleInputChange = (e) => {
    setProfileData({ ...profileData, name: e.target.value });
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("name", profileData.name);
      if (imageFile) {
        formData.append("pic", imageFile); // this will be available as req.file
      }

      // toast.info("Updating profile...");
      // toast.info("Updating profile...");
      toast("Updating profile...");

      console.log("run");

      const changedData = await api.post("/user/update-profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });
      console.log("changedData", changedData);
      // setUserData(changedData.data.user);

      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Update failed:", error);
      toast.error(error.response?.data?.message || "Failed to update profile.");
      // toast.error("Failed to update profile.");
    }
  };

  const handleLogout = async () => {
    try {
      const loadingToast = toast.loading("Logging out...");
      const response = await api.post(
        "/user/logout",
        {},
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Clear localStorage token specifically
      localStorage.removeItem("addatoken");

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
      className={`grow py-4 px-4 h-full flex justify-center items-center ${
        lightTheme ? "bg-gray-100 text-black" : "bg-[#181C14] text-white"
      }`}
    >
      <Toaster position="top-right" />
      <Paper
        elevation={8}
        className={`p-6 rounded-xl max-w-md w-full ${
          lightTheme ? "bg-white text-black" : "!bg-[#2A2A2A] text-white"
        }`}
        sx={{
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          },
        }}
      >
        <Typography
          variant="h5"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 700,
            mb: 3,
            textAlign: "center",
            color: lightTheme ? "#2C3E50" : "#E0E0E0",
          }}
        >
          My Profile
        </Typography>

        {/* Profile Image */}
        <Box className="flex flex-col items-center mb-4">
          <Box className="relative">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              id="profile-upload"
              onChange={handleImageChange}
            />
            <Avatar
              alt="Profile"
              src={uploadedImage || userData.user?.pic || defaultProfile}
              sx={{
                width: 96,
                height: 96,
                border: `3px solid ${lightTheme ? "#3498DB" : "#4DD0E1"}`,
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                "&:hover": { opacity: 0.9 },
              }}
            />
            <label
              htmlFor="profile-upload"
              className="absolute -bottom-2 -right-2 bg-blue-500 p-1.5 rounded-full cursor-pointer shadow-lg hover:bg-blue-600 transition-all duration-200"
            >
              <PhotoCameraIcon sx={{ fontSize: "1.1rem", color: "white" }} />
            </label>
          </Box>
          <Typography
            variant="caption"
            sx={{
              mt: 1.5,
              color: lightTheme ? "#666" : "#BBB",
              textAlign: "center",
            }}
          >
            Click to update photo
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Name Input */}
        <TextField
          fullWidth
          label="Name"
          variant="outlined"
          margin="normal"
          value={profileData.name}
          onChange={handleInputChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <AccountCircleIcon
                  sx={{ color: lightTheme ? "#3498DB" : "#4DD0E1" }}
                />
              </InputAdornment>
            ),
            sx: {
              backgroundColor: lightTheme ? "#ffffff" : "#3C3D37",
              borderRadius: "10px",
              "& input": { padding: "12px 14px" },
            },
          }}
        />

        {/* Username Read-Only */}
        <TextField
          fullWidth
          label="Username"
          variant="outlined"
          margin="normal"
          value={userData.user?.username || ""}
          InputProps={{
            readOnly: true,
            startAdornment: (
              <InputAdornment position="start">
                <AccountCircleIcon sx={{ color: "#888" }} />
              </InputAdornment>
            ),
            sx: {
              backgroundColor: lightTheme ? "#f5f7fa" : "#2a2a2a",
              borderRadius: "10px",
              "& input": { color: lightTheme ? "#555" : "#AAA" },
            },
          }}
        />

        {/* Email Read-Only */}
        <TextField
          fullWidth
          label="Email"
          variant="outlined"
          margin="normal"
          value={userData.user?.email || ""}
          InputProps={{
            readOnly: true,
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon sx={{ color: "#888" }} />
              </InputAdornment>
            ),
            sx: {
              backgroundColor: lightTheme ? "#f5f7fa" : "#2a2a2a",
              borderRadius: "10px",
              "& input": { color: lightTheme ? "#555" : "#AAA" },
            },
          }}
        />

        <Divider sx={{ my: 3 }} />

        {/* Buttons */}
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<SaveIcon />}
            onClick={handleSave}
            sx={{
              backgroundColor: lightTheme ? "#3498DB" : "#4DD0E1",
              color: "white",
              textTransform: "none",
              padding: "10px",
              borderRadius: "10px",
              "&:hover": {
                backgroundColor: lightTheme ? "#2980B9" : "#26C6DA",
              },
            }}
          >
            Save Changes
          </Button>

          <Button
            variant="outlined"
            fullWidth
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{
              borderColor: lightTheme ? "#E74C3C" : "#FF5252",
              color: lightTheme ? "#E74C3C" : "#FF5252",
              textTransform: "none",
              padding: "10px",
              borderRadius: "10px",
              "&:hover": {
                backgroundColor: lightTheme
                  ? "rgba(231, 76, 60, 0.08)"
                  : "rgba(255, 82, 82, 0.08)",
              },
            }}
          >
            Logout
          </Button>
        </Box>
      </Paper>
    </div>
  );
};

export default Profile;
