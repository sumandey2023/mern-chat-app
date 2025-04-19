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
import api from "../../config/axios";

const Profile = () => {
  const lightTheme = useSelector((state) => state.themeKey);
  const [userData, setUserData] = useState({});
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({
    name: "",
    profilePic: defaultProfile,
  });
  const [uploadedImage, setUploadedImage] = useState(null);

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
    }
  };

  const handleInputChange = (e) => {
    setProfileData({ ...profileData, name: e.target.value });
  };

  const handleSave = () => {
    toast.success("Profile updated successfully!");
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
        {/* Header */}
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

        {/* Profile Picture Upload */}
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
                "&:hover": {
                  opacity: 0.9,
                },
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
              display: "block",
              textAlign: "center",
            }}
          >
            Click to update photo
          </Typography>
        </Box>

        <Divider
          sx={{
            my: 3,
            borderColor: lightTheme
              ? "rgba(0,0,0,0.08)"
              : "rgba(255,255,255,0.08)",
          }}
        />

        {/* Form Fields */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="subtitle1"
            sx={{
              mb: 2,
              fontWeight: 600,
              color: lightTheme ? "#34495E" : "#B0BEC5",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <span style={{ flexGrow: 1 }}>Personal Information</span>
          </Typography>

          {/* Name (Editable) */}
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
                    sx={{
                      color: lightTheme ? "#3498DB" : "#4DD0E1",
                    }}
                  />
                </InputAdornment>
              ),
              sx: {
                backgroundColor: lightTheme ? "#ffffff" : "#3C3D37",
                borderRadius: "10px",
                "& input": {
                  padding: "12px 14px",
                },
              },
            }}
            sx={{
              mb: 2.5,
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": {
                  borderColor: lightTheme ? "#3498DB" : "#4DD0E1",
                },
                "&.Mui-focused fieldset": {
                  borderColor: lightTheme ? "#3498DB" : "#4DD0E1",
                  borderWidth: "1px",
                },
              },
              "& .MuiInputLabel-root": {
                transform: "translate(14px, 14px) scale(1)",
                "&.Mui-focused": {
                  transform: "translate(14px, -9px) scale(0.75)",
                  color: lightTheme ? "#3498DB" : "#4DD0E1",
                },
                "&.MuiFormLabel-filled": {
                  transform: "translate(14px, -9px) scale(0.75)",
                },
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
              startAdornment: (
                <InputAdornment position="start">
                  <AccountCircleIcon sx={{ color: "#888" }} />
                </InputAdornment>
              ),
              sx: {
                backgroundColor: lightTheme ? "#f5f7fa" : "#2a2a2a",
                borderRadius: "10px",
                "& input": {
                  padding: "12px 14px",
                  color: lightTheme ? "#555" : "#AAA",
                },
              },
            }}
            sx={{
              mb: 2.5,
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: lightTheme
                    ? "rgba(0,0,0,0.1)"
                    : "rgba(255,255,255,0.1)",
                },
              },
              "& .MuiInputLabel-root": {
                transform: "translate(14px, 14px) scale(1)",
                "&.Mui-focused": {
                  transform: "translate(14px, -9px) scale(0.75)",
                },
                "&.MuiFormLabel-filled": {
                  transform: "translate(14px, -9px) scale(0.75)",
                },
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
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon sx={{ color: "#888" }} />
                </InputAdornment>
              ),
              sx: {
                backgroundColor: lightTheme ? "#f5f7fa" : "#2a2a2a",
                borderRadius: "10px",
                "& input": {
                  padding: "12px 14px",
                  color: lightTheme ? "#555" : "#AAA",
                },
              },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: lightTheme
                    ? "rgba(0,0,0,0.1)"
                    : "rgba(255,255,255,0.1)",
                },
              },
              "& .MuiInputLabel-root": {
                transform: "translate(14px, 14px) scale(1)",
                "&.Mui-focused": {
                  transform: "translate(14px, -9px) scale(0.75)",
                },
                "&.MuiFormLabel-filled": {
                  transform: "translate(14px, -9px) scale(0.75)",
                },
              },
            }}
          />
        </Box>

        <Divider
          sx={{
            my: 3,
            borderColor: lightTheme
              ? "rgba(0,0,0,0.08)"
              : "rgba(255,255,255,0.08)",
          }}
        />

        {/* Buttons */}
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<SaveIcon />}
            sx={{
              backgroundColor: lightTheme ? "#3498DB" : "#4DD0E1",
              color: "white",
              textTransform: "none",
              padding: "10px",
              borderRadius: "10px",
              boxShadow: "none",
              "&:hover": {
                backgroundColor: lightTheme ? "#2980B9" : "#26C6DA",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              },
              transition: "all 0.2s ease",
            }}
            onClick={handleSave}
          >
            Save Changes
          </Button>

          <Button
            variant="outlined"
            fullWidth
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
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
                borderColor: lightTheme ? "#E74C3C" : "#FF5252",
              },
              transition: "all 0.2s ease",
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
