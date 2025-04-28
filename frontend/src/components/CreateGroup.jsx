import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  TextField,
  Button,
  Avatar,
  Chip,
  InputAdornment,
  Paper,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import {
  Search,
  Add,
  PhotoCamera as PhotoCameraIcon,
  Group as GroupIcon,
} from "@mui/icons-material";

import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import api from "../config/api";

const CreateGroup = () => {
  const lightTheme = useSelector((state) => state.themeKey);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [groupIcon, setGroupIcon] = useState({ file: null, preview: null });
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [userData, setUserData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data } = await api.get("/user/get-user-details", {
          withCredentials: true,
        });
        setUserData(data);
      } catch (error) {
        console.error("Failed to fetch user details:", error);
        toast.error("Failed to load user information");
      }
    };
    getUser();
  }, []);

  useEffect(() => {
    return () => {
      // Clean up object URL when component unmounts
      if (groupIcon.preview) URL.revokeObjectURL(groupIcon.preview);
    };
  }, [groupIcon]);

  const handleGroupIconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageURL = URL.createObjectURL(file);
      setGroupIcon({ file, preview: imageURL });
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      if (!searchQuery.trim()) {
        setFilteredUsers([]);
        setSearchError(null);
        return;
      }

      setIsSearching(true);
      setSearchError(null);

      try {
        const res = await fetch(
          `${api.defaults.baseURL}/user/searchUsers?search=${searchQuery}`,
          {
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) {
          if (res.status === 401) {
            setSearchError("Please login to search users");
            setFilteredUsers([]);
            return;
          }
          throw new Error("Failed to fetch users");
        }

        const result = await res.json();
        setFilteredUsers(result);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        setSearchError("Failed to search users. Please try again.");
        setFilteredUsers([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleAddUser = (user) => {
    if (selectedUsers.some((u) => u._id === user._id)) {
      toast.error("User already selected");
      return;
    }
    if (selectedUsers.length >= 10) {
      toast.error("You can only add up to 10 members");
      return;
    }
    setSelectedUsers([...selectedUsers, user]);
    setSearchQuery("");
  };

  const handleRemoveUser = (userId) => {
    setSelectedUsers(selectedUsers.filter((u) => u._id !== userId));
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast.error("Group name is required");
      return;
    }

    if (selectedUsers.length === 0) {
      toast.error("Select at least one member for the group");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create a FormData object to send both text data and file
      const formData = new FormData();

      // Add group info
      const groupData = {
        groupName,
        groupDescription,
        members: [...selectedUsers.map((user) => user._id), userData.user._id],
        pic: null, // This will be handled by the file upload
        admin: userData.user._id,
      };

      // Add the JSON data
      formData.append("groupInfo", JSON.stringify(groupData));

      // Add the file if it exists
      if (groupIcon.file) {
        formData.append("pic", groupIcon.file);
      }
      toast.info("Creating group...", {
        autoClose: 10000,
      });

      // Make a single request with all the data
      const { data } = await api.post("/group/createGroup", formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Group created successfully!");
      navigate("/app/groups", {
        state: { createGroupMessage: "Group created successfully!" },
      });
    } catch (error) {
      console.error("Failed to create group:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to create group";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`bg-gray-100 flex items-center justify-center min-h-screen p-6 ${
        lightTheme ? "" : "!bg-[#181C14]"
      }`}
    >
      <Paper
        elevation={4}
        className={`rounded-3xl p-8 w-full max-w-md bg-white ${
          lightTheme ? "" : "!bg-[#3C3D37]"
        }`}
      >
        <Box className="flex flex-col items-center mb-6">
          <Box className="relative">
            <Avatar
              alt="Group Icon"
              src={groupIcon.preview}
              sx={{
                width: 120,
                height: 120,
                border: `4px solid ${lightTheme ? "#3498DB" : "#4DD0E1"}`,
                backgroundColor: lightTheme ? "#f0f7fc" : "#223240",
                boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
              }}
            >
              {!groupIcon.preview && (
                <GroupIcon
                  sx={{
                    fontSize: "3.5rem",
                    color: lightTheme ? "#3498DB" : "#4DD0E1",
                  }}
                />
              )}
            </Avatar>

            <label
              htmlFor="group-icon-upload"
              className="absolute -bottom-1 -right-1 bg-blue-500 p-1 rounded-full cursor-pointer shadow-lg hover:bg-blue-600 transition-all duration-200"
            >
              <PhotoCameraIcon sx={{ fontSize: "1.3rem", color: "white" }} />
            </label>
          </Box>

          <input
            type="file"
            accept="image/*"
            className="hidden"
            id="group-icon-upload"
            onChange={handleGroupIconChange}
          />
          <Typography
            variant="caption"
            sx={{
              mt: 2,
              color: lightTheme ? "#666" : "#BBB",
              textAlign: "center",
              fontSize: "0.85rem",
            }}
          >
            Upload group icon (optional)
          </Typography>
        </Box>

        <TextField
          label="Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          fullWidth
          placeholder="Enter a name for your group"
          sx={{
            mb: 2,
            "& .MuiOutlinedInput-root": { borderRadius: "12px" },
            "& .MuiOutlinedInput-input": {
              color: lightTheme ? undefined : "white",
              padding: "14px",
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: lightTheme ? undefined : "rgba(255,255,255,0.3)",
            },
          }}
        />

        <TextField
          label="Group Description"
          value={groupDescription}
          onChange={(e) => setGroupDescription(e.target.value)}
          fullWidth
          multiline
          rows={2}
          placeholder="What's this group about? (optional)"
          sx={{
            mb: 4,
            "& .MuiOutlinedInput-root": { borderRadius: "12px" },
            "& .MuiOutlinedInput-input": {
              color: lightTheme ? undefined : "white",
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: lightTheme ? undefined : "rgba(255,255,255,0.3)",
            },
          }}
        />

        <TextField
          label="Search Users"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          fullWidth
          placeholder="Search by name or email"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
            className: lightTheme ? "" : "!text-white",
          }}
          sx={{
            mb: 3,
            "& .MuiOutlinedInput-root": { borderRadius: "12px" },
            "& .MuiOutlinedInput-input": { padding: "14px" },
          }}
        />

        {selectedUsers.length > 0 && (
          <Box className="mb-3">
            <Typography
              variant="body2"
              className={`mb-2 text-gray-600 ${
                lightTheme ? "" : "!text-gray-300"
              }`}
            >
              Selected Members ({selectedUsers.length})
            </Typography>
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map((user) => (
                <Chip
                  key={user._id}
                  avatar={<Avatar alt={user.name} src={user.pic} />}
                  label={user.name}
                  onDelete={() => handleRemoveUser(user._id)}
                  sx={{ borderRadius: "8px", padding: "2px 0" }}
                />
              ))}
            </div>
          </Box>
        )}

        {searchQuery && (
          <Box
            className={`max-h-52 overflow-y-auto mb-4 rounded-xl p-2 ${
              lightTheme ? "bg-gray-50" : "!bg-[#181C14]"
            } shadow-md`}
          >
            {isSearching ? (
              <div className="flex items-center justify-center py-4">
                <CircularProgress size={24} className="text-blue-500" />
                <span className="ml-2 text-gray-500">Searching...</span>
              </div>
            ) : searchError ? (
              <div className="text-center py-4 text-red-500 bg-red-50 rounded-lg">
                {searchError}
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No users found matching "{searchQuery}"
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user._id}
                  className={`flex items-center justify-between p-3 mb-1 rounded-lg cursor-pointer hover:bg-gray-200 ${
                    lightTheme ? "" : "hover:bg-gray-800 !bg-[#181C14]"
                  }`}
                  onClick={() => handleAddUser(user)}
                >
                  <div className="flex items-center">
                    <Avatar
                      src={user.pic}
                      alt={user.name}
                      sx={{
                        width: 40,
                        height: 40,
                        border: `2px solid ${
                          lightTheme ? "#e5e7eb" : "#4b5563"
                        }`,
                      }}
                    />
                    <div className="ml-3">
                      <Typography
                        className={`font-medium ${
                          lightTheme ? "" : "!text-white"
                        }`}
                      >
                        {user.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        className={`text-gray-500 ${
                          lightTheme ? "" : "!text-gray-400"
                        }`}
                      >
                        @{user.username}
                      </Typography>
                    </div>
                  </div>
                  <Add
                    className={`${
                      lightTheme ? "" : "text-white"
                    } hover:text-blue-500`}
                  />
                </div>
              ))
            )}
          </Box>
        )}

        <Button
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          onClick={handleCreateGroup}
          disabled={
            !groupName.trim() || selectedUsers.length === 0 || isSubmitting
          }
          sx={{
            mt: 2,
            borderRadius: "12px",
            textTransform: "none",
            fontWeight: "bold",
            fontSize: "1rem",
            padding: "12px",
          }}
        >
          {isSubmitting ? "Creating..." : "Create Group"}
        </Button>
      </Paper>
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

export default CreateGroup;
