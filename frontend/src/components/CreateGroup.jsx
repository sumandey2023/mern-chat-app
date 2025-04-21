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
  IconButton,
  Box,
  Divider,
} from "@mui/material";
import {
  Search,
  Add,
  Delete as DeleteIcon,
  PhotoCamera as PhotoCameraIcon,
  Group as GroupIcon,
} from "@mui/icons-material";

import { toast, ToastContainer } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../config/axios";
import BASE_URL from "../../config/api";

// ⚠️ Update path according to your project structure

const CreateGroup = () => {
  const lightTheme = useSelector((state) => state.themeKey);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [groupIcon, setGroupIcon] = useState({ file: null, preview: null });
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [userData, setUserData] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

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

  useEffect(() => {
    return () => {
      if (groupIcon.preview) URL.revokeObjectURL(groupIcon.preview);
    };
  }, [groupIcon]);

  const handleGroupIconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      const imageURL = URL.createObjectURL(file);
      setGroupIcon({ file, preview: imageURL });
    }
  };

  const handleRemoveGroupIcon = () => {
    if (groupIcon.preview) URL.revokeObjectURL(groupIcon.preview);
    setGroupIcon({ file: null, preview: null });
  };

  const uploadGroupIcon = async (file) => {
    try {
      const formData = new FormData();
      formData.append("groupIcon", file);

      const response = await api.post("/group/upload-icon", formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data.iconUrl;
    } catch (error) {
      console.error("Group icon upload failed:", error);
      throw new Error("Failed to upload group icon");
    }
  };

  const mockUsers = [
    { id: 1, name: "Alex Johnson", avatar: "AJ", email: "alex@example.com" },
    { id: 2, name: "Maya Patel", avatar: "MP", email: "maya@example.com" },
    {
      id: 3,
      name: "Carlos Rodriguez",
      avatar: "CR",
      email: "carlos@example.com",
    },
    { id: 4, name: "Sarah Kim", avatar: "SK", email: "sarah@example.com" },
    { id: 5, name: "John Smith", avatar: "JS", email: "john@example.com" },
  ];

  // const filteredUsers = mockUsers
  //   .filter(
  //     (user) =>
  //       user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //       user.email.toLowerCase().includes(searchQuery.toLowerCase())
  //   )
  //   .filter((user) => !selectedUsers.some((u) => u.id === user.id));

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/user/searchUsers?search=${searchQuery}`,
          {
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) {
          if (res.status === 401) {
            console.error("User is not authenticated");
            toast.error("User is not authenticated");
            navigate("/login"); // Redirect to login page

            return;
          }
          throw new Error("Failed to fetch users");
        }
        const result = await res.json();
        setFilteredUsers(result);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        toast.error("Failed to fetch users");
        setFilteredUsers([]);
      }
    };

    const debounceTimer = setTimeout(() => {
      if (searchQuery.trim() !== "") {
        fetchUsers();
      } else {
        setFilteredUsers([]);
      }
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
    try {
      let iconUrl = null;
      if (groupIcon.file) {
        iconUrl = await uploadGroupIcon(groupIcon.file);
      }

      // Add the logged-in user to the group
      const groupData = {
        groupName,
        groupDescription,
        members: [...selectedUsers.map((user) => user._id), userData.user._id],
        pic: iconUrl,
        admin: userData.user._id,
      };

      const { newGroup } = await api.post("/group/createGroup", groupData, {
        withCredentials: true,
      });

      toast.success("Group created successfully!");
      navigate("/app/groups", {
        state: { createGroupMessage: "Group created successfully!" },
      });
    } catch (error) {
      toast.error("Failed to create group");
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
              className="absolute -bottom-3 -right-2 bg-blue-500 p-2 rounded-full cursor-pointer shadow-lg hover:bg-blue-600 transition-all duration-200"
            >
              <PhotoCameraIcon sx={{ fontSize: "1.3rem", color: "white" }} />
            </label>

            {groupIcon.preview && (
              <IconButton
                onClick={handleRemoveGroupIcon}
                size="small"
                sx={{
                  position: "absolute",
                  top: -5,
                  right: -5,
                  backgroundColor: lightTheme ? "#E74C3C" : "#FF5252",
                  color: "white",
                  "&:hover": {
                    backgroundColor: lightTheme ? "#C0392B" : "#D32F2F",
                  },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
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

        {/* <Divider
          className={`my-6 mb-2 ${lightTheme ? "bg-gray-200" : "!bg-gray-700"}`}
        /> */}

        {/* <Typography
          variant="subtitle1"
          className={`mb-2 font-medium text-gray-700 ${
            lightTheme ? "" : "!text-gray-200"
          }`}
        >
          Add Members
        </Typography> */}

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
                  avatar={<Avatar>{user.avatar}</Avatar>}
                  label={user.name}
                  onDelete={() => handleRemoveUser(user._id)}
                  sx={{ borderRadius: "8px", padding: "2px 0" }}
                />
              ))}
            </div>
          </Box>
        )}

        {searchQuery && filteredUsers.length > 0 && (
          <Box
            className={`max-h-52 overflow-y-auto mb-4 rounded-xl p-2 bg-gray-50 ${
              lightTheme ? "" : "!bg-[#181C14]"
            } shadow-md`}
          >
            {filteredUsers.map((user) => (
              <div
                key={user._id}
                className={`flex items-center justify-between p-3 mb-1 rounded-lg cursor-pointer hover:bg-gray-200 ${
                  lightTheme ? "" : "!bg-[#181C14]"
                } `}
                onClick={() => handleAddUser(user)}
              >
                <div className="flex items-center">
                  <Avatar className="mr-2 w-8 h-8 rounded-full overflow-hidden">
                    <img
                      src={user.pic}
                      alt="User Avatar"
                      className="w-full h-full object-cover"
                    />
                  </Avatar>

                  <div>
                    <Typography
                      className={`font-medium ${
                        lightTheme ? "" : "!text-white"
                      }`}
                    >
                      {user.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      className={` text-gray-500 ${
                        lightTheme ? "" : "!text-gray-400"
                      }`}
                    >
                      @{user.username}
                    </Typography>
                  </div>
                </div>
                <Add
                  className={` ${
                    lightTheme ? "" : "text-white"
                  } hover:text-blue-500`}
                />
              </div>
            ))}
          </Box>
        )}

        <Button
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          onClick={handleCreateGroup}
          disabled={!groupName.trim() || selectedUsers.length === 0}
          sx={{
            mt: 2,
            borderRadius: "12px",
            textTransform: "none",
            fontWeight: "bold",
            fontSize: "1rem",
            padding: "12px",
          }}
        >
          Create Group
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
