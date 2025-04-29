import React, { useEffect, useState } from "react";
import {
  Paper,
  TextField,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useSelector } from "react-redux";
import QRCode from "react-qr-code";
import api from "../config/api";

const ProfileShare = () => {
  const lightTheme = useSelector((state) => state.themeKey);
  const [profileLink, setProfileLink] = useState("");

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const data = await api.get("/user/get-user-details", {
          withCredentials: true,
        });

        setProfileLink(
          `https://adda-pi.vercel.app/app/chat/${data.data.user._id}`
        );
        console.log(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchUserDetails();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(profileLink);
  };

  return (
    <div
      className={`grow py-4 px-4 h-full flex justify-center items-center ${
        lightTheme ? "bg-gray-100 text-black" : "bg-[#181C14] text-white"
      }`}
    >
      <Paper
        elevation={12}
        className={`p-8 rounded-2xl max-w-md w-full ${
          lightTheme ? "bg-white text-black" : "!bg-[#2A2A2A] text-white"
        }`}
        sx={{
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
          },
        }}
      >
        {/* Header */}
        <Typography
          variant="h5"
          component="h1"
          className={`text-center mb-6 ${
            lightTheme ? "text-indigo-600" : "text-indigo-400"
          }`}
        >
          Profile QR & Generate QR
        </Typography>

        {/* QR Code */}
        <div
          className={`flex justify-center mb-6 p-4 rounded-xl ${
            lightTheme ? "bg-gray-50 shadow-md" : "bg-[#3a3a3a] shadow-lg"
          }`}
        >
          <QRCode
            value={profileLink}
            size={220}
            bgColor="#ffffff"
            fgColor="#4f46e5" // Tailwind's indigo-600
            style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }} // subtle shadow around QR
          />
        </div>

        {/* Link and Copy Button */}
        <div className="flex items-center gap-2">
          <TextField
            label="Share Profile Link"
            variant="outlined"
            fullWidth
            value={profileLink}
            onChange={(e) => setProfileLink(e.target.value)}
            InputLabelProps={{
              style: { color: lightTheme ? "#000" : "#fff" },
            }}
            InputProps={{
              style: {
                color: lightTheme ? "#000" : "#fff",
                backgroundColor: lightTheme ? "#fff" : "#3a3a3a",
                borderRadius: 8,
              },
            }}
          />
          <Tooltip title="Copy Link">
            <IconButton
              onClick={handleCopy}
              sx={{
                color: lightTheme ? "#333" : "#fff",
                backgroundColor: lightTheme ? "#e0e0e0" : "#4a4a4a",
                "&:hover": {
                  backgroundColor: lightTheme ? "#d5d5d5" : "#5a5a5a",
                },
              }}
            >
              <ContentCopyIcon />
            </IconButton>
          </Tooltip>
        </div>
      </Paper>
    </div>
  );
};

export default ProfileShare;
