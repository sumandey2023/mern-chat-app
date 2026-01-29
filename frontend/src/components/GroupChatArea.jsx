import React, { useEffect, useRef, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import MessageOther from "./MessageOther";
import MessageSelf from "./MessageSelf";
import MicIcon from "@mui/icons-material/Mic";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import TelegramIcon from "@mui/icons-material/Telegram";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import CloseIcon from "@mui/icons-material/Close";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import InfoIcon from "@mui/icons-material/Info";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import {
  Avatar,
  IconButton,
  Tooltip,
  ClickAwayListener,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Collapse,
  Box,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress,
} from "@mui/material";
import {
  Search,
  Add,
  ExpandMore,
  ExpandLess,
  Group as GroupIcon,
  ExitToApp,
} from "@mui/icons-material";
import { useMediaQuery } from "react-responsive";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import api from "../config/api";
import EmojiPicker from "emoji-picker-react";
import { io } from "socket.io-client";
import { format } from "date-fns";
import MessageOtherGroup from "./MessageOtherGroup";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const GroupChatArea = () => {
  const isSmallScreen = useMediaQuery({ maxWidth: 1150 });
  const lightTheme = useSelector((state) => state.themeKey);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [messageToBeSend, setMessageToBeSend] = useState("");
  const scrollRef = useRef(null);
  const socket = useRef();
  const typingTimeoutRef = useRef(null);
  const { id } = useParams();
  const [groupDetail, setGroupDetail] = useState({});
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [openAddMemberDialog, setOpenAddMemberDialog] = useState(false);
  const [openRemoveConfirmDialog, setOpenRemoveConfirmDialog] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState({});
  const [memberList, setMemberList] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [allMessages, setAllMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [openMakeAdminConfirmDialog, setOpenMakeAdminConfirmDialog] =
    useState(false);
  const [memberToMakeAdmin, setMemberToMakeAdmin] = useState(null);
  const [openLeaveGroupConfirmDialog, setOpenLeaveGroupConfirmDialog] =
    useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    socket.current = io(api.defaults.baseURL, {
      withCredentials: true,
    });

    // Join group room
    socket.current.emit("joinGroup", id);
    console.log("Joined group room:", id);

    // Listen for group messages
    socket.current.on("receiveGroupMessage", async (data) => {
      // Only add message if it's not from the current user
      if (data.senderId !== loggedInUser._id) {
        // If senderId is just an ID, fetch the complete user data
        if (typeof data.senderId === "string") {
          try {
            const { data: userData } = await api.get(
              `/user/get-chat-user/${data.senderId}`,
              {
                withCredentials: true,
              },
            );
            // Update the message with complete sender information
            data.senderId = userData;
          } catch (error) {
            console.error("Error fetching sender data:", error);
          }
        }
        setAllMessages((prev) => [...prev, data]);
      }
    });

    // Listen for typing indicators
    socket.current.on("groupUserTyping", (data) => {
      if (data.senderId !== loggedInUser._id) {
        if (data.isTyping) {
          setTypingUsers((prev) => new Set([...prev, data.senderId]));
        } else {
          setTypingUsers((prev) => {
            const newSet = new Set(prev);
            newSet.delete(data.senderId);
            return newSet;
          });
        }
      }
    });

    // Listen for group member updates
    socket.current.on("groupMemberUpdated", async (data) => {
      console.log("Received group member update:", data);
      if (data.groupId === id) {
        try {
          // Update group details directly from the socket data if available
          if (data.updatedGroup) {
            setGroupDetail(data.updatedGroup);
          } else {
            // Fallback to API call if updatedGroup is not available
            const { data: groupData } = await api.get(
              `/group/groupDetails/${id}`,
              {
                withCredentials: true,
              },
            );
            setGroupDetail(groupData);
          }

          // Refresh member list
          const { data: memberData } = await api.get(
            `/group/groupMemberList/${id}`,
            {
              withCredentials: true,
            },
          );
          setMemberList(memberData.members);
          setAdmins(memberData.admin);

          console.log("Group details updated successfully");
        } catch (error) {
          console.error("Error refreshing group details:", error);
        }
      }
    });

    // Clean up on component unmount
    return () => {
      console.log("Leaving group room:", id);
      socket.current.emit("leaveGroup", id);
      socket.current.disconnect();
    };
  }, [id, loggedInUser._id]);

  // Add user to socket when logged in
  useEffect(() => {
    if (loggedInUser && loggedInUser._id) {
      socket.current.emit("addUser", loggedInUser._id);
    }
  }, [loggedInUser]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [allMessages]);

  // Scroll to bottom when typing indicator changes
  useEffect(() => {
    if (typingUsers.size > 0 && scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [typingUsers]);

  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        const { data } = await api.get(`/group/groupDetails/${id}`, {
          withCredentials: true,
        });
        setGroupDetail(data);
        console.log("Group details:", data);
      } catch (error) {
        console.error("Error fetching group details:", error);
      }
    };
    fetchGroupDetails();
  }, [id]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery.trim()) {
        fetchUsers();
      } else {
        setFilteredUsers([]);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

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
        },
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
      // Filter out users who are already members of the group
      const filteredResult = result.filter(
        (user) =>
          !groupDetail.members?.some((member) => member._id === user._id),
      );
      setFilteredUsers(filteredResult);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setSearchError("Failed to search users. Please try again.");
      setFilteredUsers([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddUser = (user) => {
    // Check if user is already selected
    if (selectedUsers.some((u) => u._id === user._id)) {
      toast.error("User already selected");
      return;
    }

    // Check if user is already a member of the group
    if (groupDetail.members?.some((member) => member._id === user._id)) {
      toast.error("User is already a member of the group");
      return;
    }

    // Check if maximum members limit is reached
    if (selectedUsers.length >= 10) {
      toast.error("You can only add up to 10 members at once");
      return;
    }

    // Add user to selected users
    setSelectedUsers([...selectedUsers, user]);
    setSearchQuery(""); // Clear search after selection
  };

  const handleRemoveSelectedUser = (userId) => {
    setSelectedUsers(selectedUsers.filter((u) => u._id !== userId));
  };

  const handleAddMembersToGroup = async () => {
    try {
      const dataToSend = {
        groupId: id,
        addList: selectedUsers.map((user) => user._id),
      };

      const { data } = await api.post("/group/addNewMember", dataToSend, {
        withCredentials: true,
      });

      // Show success message
      toast.success(data.message || "Members added successfully");

      // Close dialog and reset state
      setOpenAddMemberDialog(false);
      setSelectedUsers([]);
      setSearchQuery("");

      // Refresh group members list
      const { data: memberData } = await api.get(
        `/group/groupMemberList/${id}`,
        {
          withCredentials: true,
        },
      );
      setMemberList(memberData.members);
      setAdmins(memberData.admin);

      // Refresh group details
      const { data: groupData } = await api.get(`/group/groupDetails/${id}`, {
        withCredentials: true,
      });
      setGroupDetail(groupData);
    } catch (error) {
      console.error("Error adding members to group:", error);
      toast.error(error.response?.data?.message || "Failed to add members");
    }
  };

  const handleOpenDialog = (memberId) => {
    setSelectedMemberId(memberId);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleRemoveMember = async (memberId) => {
    setMemberToRemove(memberId);
    setOpenRemoveConfirmDialog(true);
  };

  const handleConfirmRemove = async () => {
    try {
      const data = { removeUserId: memberToRemove };
      const removeMember = await api.post(`/group/removeMember/${id}`, data, {
        withCredentials: true,
      });

      toast.info(removeMember.data.message);

      const { data: memberData } = await api.get(
        `/group/groupMemberList/${id}`,
        {
          withCredentials: true,
        },
      );
      setMemberList(memberData.members);
      setAdmins(memberData.admin);

      try {
        const { data } = await api.get(`/group/groupDetails/${id}`, {
          withCredentials: true,
        });
        setGroupDetail(data);
        console.log("Group details:", data);
      } catch (error) {
        console.error("Error fetching group details:", error);
      }
    } catch (error) {
      toast.info(error.message);
      console.log(error);
    } finally {
      setOpenRemoveConfirmDialog(false);
      setMemberToRemove(null);
    }
  };

  const handleMakeAdmin = async (memberId) => {
    setMemberToMakeAdmin(memberId);
    setOpenMakeAdminConfirmDialog(true);
  };

  const handleConfirmMakeAdmin = async () => {
    try {
      const data = {
        id: memberToMakeAdmin,
      };
      const addedAdmin = await api.post(`/group/makeAdmin/${id}`, data, {
        withCredentials: true,
      });

      toast.info(addedAdmin.data.message);

      // Refresh member list and admin list
      const { data: memberData } = await api.get(
        `/group/groupMemberList/${id}`,
        {
          withCredentials: true,
        },
      );
      setMemberList(memberData.members);
      setAdmins(memberData.admin);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setOpenMakeAdminConfirmDialog(false);
      setMemberToMakeAdmin(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMMM d, yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker((prev) => !prev);
  };

  const handleEmojiClick = (emoji) => {
    setMessageToBeSend((prev) => prev + emoji.emoji);
    setShowEmojiPicker(false);
  };

  const handleClickAway = () => {
    setShowEmojiPicker(false);
  };

  const handleAttachClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };
  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };
  const handleRemoveFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async () => {
    if (selectedFiles.length > 0) {
      // Create temp messages for each file
      const tempIds = [];
      const tempMessages = selectedFiles.map((file) => {
        const tempId = Date.now().toString() + Math.random();
        tempIds.push(tempId);
        const fileType = file.type.split("/")[0];
        return {
          _id: tempId,
          senderId: loggedInUser,
          createdAt: new Date().toISOString(),
          isTemp: true,
          image: fileType === "image" ? URL.createObjectURL(file) : undefined,
          video: fileType === "video" ? URL.createObjectURL(file) : undefined,
          audio: fileType === "audio" ? URL.createObjectURL(file) : undefined,
          file:
            fileType !== "image" && fileType !== "video" && fileType !== "audio"
              ? file.name
              : undefined,
        };
      });
      setAllMessages((prev) => [...prev, ...tempMessages]);
      setSelectedFiles([]);

      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });

      try {
        const { data } = await api.post(`/group/sendMessage/${id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        });
        // If data is an array (files), handle each message
        if (Array.isArray(data)) {
          data.forEach((msg) => {
            socket.current.emit("sendGroupMessage", msg);
          });
          // Replace temp messages with real ones
          setAllMessages((prev) => [
            ...prev.filter((msg) => !msg.isTemp || !tempIds.includes(msg._id)),
            ...data,
          ]);
        } else {
          socket.current.emit("sendGroupMessage", data);
          setAllMessages((prev) => [
            ...prev.filter((msg) => !msg.isTemp || !tempIds.includes(msg._id)),
            data,
          ]);
        }
      } catch (error) {
        // Remove temp messages on error
        setAllMessages((prev) =>
          prev.filter((msg) => !msg.isTemp || !tempIds.includes(msg._id)),
        );
        toast.error("Failed to send file(s). Please try again.");
      }
      return;
    }
    if (!messageToBeSend.trim()) return;

    // Create a temporary message object
    const tempMessage = {
      text: messageToBeSend,
      senderId: loggedInUser,
      createdAt: new Date().toISOString(),
      isTemp: true,
    };

    // Update local state immediately
    setAllMessages((prev) => [...prev, tempMessage]);
    setMessageToBeSend("");
    setShowEmojiPicker(false);

    // Send stop typing event
    socket.current.emit("groupTyping", {
      senderId: loggedInUser._id,
      groupId: id,
      isTyping: false,
    });

    // Scroll to bottom after sending message
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);

    try {
      const { data } = await api.post(
        `/group/sendMessage/${id}`,
        {
          text: messageToBeSend,
        },
        {
          withCredentials: true,
        },
      );

      // Send message through socket
      socket.current.emit("sendGroupMessage", {
        ...data,
        groupId: id,
        senderId: loggedInUser._id,
      });

      // Update the temporary message with the actual message data from the server
      setAllMessages((prev) =>
        prev.map((msg) =>
          msg === tempMessage ? { ...data, senderId: loggedInUser } : msg,
        ),
      );
    } catch (error) {
      console.error("Failed to send message:", error);
      // Remove the temporary message if the API call fails
      setAllMessages((prev) => prev.filter((msg) => msg !== tempMessage));
      toast.error("Failed to send message. Please try again.");
    }
  };

  const handleTyping = (e) => {
    setMessageToBeSend(e.target.value);

    // Send typing status to socket
    if (!isTyping) {
      setIsTyping(true);
      socket.current.emit("groupTyping", {
        senderId: loggedInUser._id,
        groupId: id,
        isTyping: true,
      });
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout for when user stops typing
    typingTimeoutRef.current = setTimeout(() => {
      socket.current.emit("groupTyping", {
        senderId: loggedInUser._id,
        groupId: id,
        isTyping: false,
      });
      setIsTyping(false);
    }, 2000);
  };

  useEffect(() => {
    const fetchGroupMembers = async () => {
      try {
        const { data } = await api.get(`/group/groupMemberList/${id}`, {
          withCredentials: true,
        });
        setMemberList(data.members);
        setAdmins(data.admin);
      } catch (error) {
        console.error("Error fetching group members:", error);
      }
    };
    fetchGroupMembers();
  }, []);

  useEffect(() => {
    const getLoggedInUser = async () => {
      try {
        const { data } = await api.get("/user/get-user-details", {
          withCredentials: true,
        });
        setLoggedInUser(data.user);
      } catch (error) {
        console.log(error);
      }
    };
    getLoggedInUser();
  }, []);

  useEffect(() => {
    const fetchGroupMessages = async () => {
      try {
        const messages = await api.get(`/group/allChats/${id}`, {
          withCredentials: true,
        });
        setAllMessages(messages.data);
      } catch (error) {
        console.log(error.message);
      }
    };
    fetchGroupMessages();
  }, []);

  // Function to format time for messages
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Function to format date for message date headers
  const formatMessageDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if date is today
    if (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    ) {
      return "Today";
    }

    // Check if date is yesterday
    if (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    ) {
      return "Yesterday";
    }

    // Return formatted date for older messages
    return date.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Group messages by date
  const groupMessagesByDate = () => {
    const groupedMessages = [];
    let currentDate = null;

    allMessages.forEach((message) => {
      const messageDate = new Date(message.createdAt).setHours(0, 0, 0, 0);

      if (currentDate !== messageDate) {
        currentDate = messageDate;
        groupedMessages.push({
          type: "date",
          date: message.createdAt,
          id: `date-${messageDate}`,
        });
      }

      groupedMessages.push({
        type: "message",
        data: message,
      });
    });

    return groupedMessages;
  };

  const handleLeaveGroup = async () => {
    setOpenLeaveGroupConfirmDialog(true);
  };

  const handleConfirmLeaveGroup = async () => {
    try {
      const data = await api.get(`/group/leaveGroup/${id}`, {
        withCredentials: true,
      });

      toast.info(data.data.message, {
        autoClose: 7000,
      });
      if (
        data.data.message ===
        "You can't leave as the only admin. Please assign another admin first."
      ) {
        return;
      }
      navigate("/app/groups", {
        state: { leaveGroup: "Left the group successfully!" },
      });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setOpenLeaveGroupConfirmDialog(false);
    }
  };

  const groupedMessages = groupMessagesByDate();

  return (
    <div
      className={`grow py-4 px-3 h-full transition-colors duration-300 ${
        lightTheme ? "bg-gray-100" : "bg-[#181C14]"
      } transition-all duration-300`}
    >
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
        theme={lightTheme ? "light" : "dark"}
      />

      <div
        className={`flex flex-col h-full rounded-2xl shadow-lg overflow-hidden transition-colors duration-300 ${
          lightTheme ? "bg-white" : "bg-[#3C3D37]"
        } transition-all duration-300`}
      >
        {/* Header - Fixed at top */}
        <div
          className={`flex items-center justify-between px-4 py-3 border-b transition-colors duration-300 ${
            lightTheme
              ? "bg-white border-gray-200"
              : "bg-[#2A2D27] border-gray-700"
          } transition-all duration-300 sticky top-0 z-10`}
        >
          <div className="flex items-center">
            <div className="relative">
              <Avatar
                alt={groupDetail?.groupName || "Group"}
                src={groupDetail?.pic}
                sx={{
                  width: 50,
                  height: 50,
                  border: `2px solid ${
                    lightTheme ? "#e5e7eb" : "#4b5563"
                  } transition-all duration-300`,
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  bgcolor: lightTheme ? "#f0f7fc" : "#223240",
                }}
              >
                {!groupDetail?.pic && (
                  <GroupIcon
                    sx={{
                      fontSize: "1.8rem",
                      color: lightTheme ? "#3498DB" : "#4DD0E1",
                    }}
                  />
                )}
              </Avatar>
            </div>

            <div className="ml-3 flex-grow">
              <h1
                className={`text-base lg:text-lg font-semibold ${
                  lightTheme ? "text-gray-800" : "text-white"
                } transition-all duration-300`}
              >
                {groupDetail?.groupName || "Loading..."}
              </h1>
              <p
                className={`text-xs ${
                  lightTheme ? "text-gray-500" : "text-gray-300"
                }`}
              >
                {groupDetail?.members?.length || 0} members
              </p>
            </div>
          </div>

          <div className="flex items-center">
            <Tooltip title="Group Info">
              <IconButton
                onClick={() => setShowGroupInfo(!showGroupInfo)}
                className={`${
                  showGroupInfo
                    ? lightTheme
                      ? "bg-gray-200"
                      : "bg-[#4A4B45]"
                    : ""
                }`}
              >
                <InfoIcon
                  className={lightTheme ? "text-gray-700" : "text-gray-300"}
                />
              </IconButton>
            </Tooltip>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden relative">
          {/* Main chat area */}
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Chat Messages Area with Fixed Scrollbar */}
            <div
              className={`flex-1 p-3 lg:p-4 overflow-y-auto chat-container scroll-smooth no-scrollbar ${
                lightTheme
                  ? "bg-gray-50 "
                  : "bg-gradient-to-b from-[#2A2D27] to-[#323329] "
              } transition-all duration-300`}
              style={{
                overflowY: "auto",
                maxHeight: "calc(100vh - 200px)",
              }}
            >
              {groupedMessages.map((item, index) => {
                if (item.type === "date") {
                  return (
                    <div key={item.id} className="flex justify-center my-3">
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          lightTheme
                            ? "bg-gray-200 text-gray-600"
                            : "bg-gray-700 text-gray-300"
                        }`}
                      >
                        {formatMessageDate(item.date)}
                      </div>
                    </div>
                  );
                } else {
                  const message = item.data;
                  const isCurrentUser =
                    typeof message.senderId === "object"
                      ? message.senderId._id === loggedInUser._id
                      : message.senderId === loggedInUser._id;

                  const handleDeleteGroupMessage = (messageId) => {
                    setAllMessages((prev) =>
                      prev.filter((msg) => msg._id !== messageId),
                    );
                  };

                  return isCurrentUser ? (
                    <MessageSelf
                      key={`msg-${index}`}
                      text={message.text}
                      time={formatTime(message.createdAt)}
                      image={message.image}
                      video={message.video}
                      audio={message.audio}
                      file={message.file}
                      isTemp={message.isTemp}
                      messageId={message._id}
                      onDelete={handleDeleteGroupMessage}
                      isGroupMessage={true}
                    />
                  ) : (
                    <MessageOtherGroup
                      key={`msg-${index}`}
                      text={message.text}
                      pic={
                        typeof message.senderId === "object"
                          ? message.senderId?.pic
                          : null
                      }
                      time={formatTime(message.createdAt)}
                      senderName={
                        typeof message.senderId === "object"
                          ? message.senderId?.name
                          : null
                      }
                      image={message.image}
                      video={message.video}
                      audio={message.audio}
                      file={message.file}
                    />
                  );
                }
              })}

              {/* Typing indicator */}
              {typingUsers.size > 0 && (
                <div className="flex items-center gap-2 mt-2 mb-2 px-2">
                  <Avatar
                    alt="Typing User"
                    src={memberList.find((m) => typingUsers.has(m._id))?.pic}
                    sx={{ width: 24, height: 24 }}
                  />
                  <div
                    className={`px-3 py-2 rounded-lg ${
                      lightTheme ? "bg-gray-200" : "bg-[#4A4B45]"
                    }`}
                  >
                    <div className="flex gap-1">
                      <span
                        className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></span>
                      <span
                        className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"
                        style={{ animationDelay: "200ms" }}
                      ></span>
                      <span
                        className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"
                        style={{ animationDelay: "400ms" }}
                      ></span>
                    </div>
                    <Typography
                      variant="body2"
                      className={`text-xs ${
                        lightTheme ? "text-gray-600" : "text-gray-300"
                      }`}
                    >
                      {/* {typingUsers.size === 1
                        ? "Someone is typing..."
                        : `${typingUsers.size} people are typing...`} */}
                    </Typography>
                  </div>
                </div>
              )}

              <div ref={scrollRef} />
            </div>

            {/* Input area - Fixed at bottom */}
            <div
              className={`px-3 py-2 border-t transition-colors duration-300 ${
                lightTheme
                  ? "bg-white border-gray-200"
                  : "bg-[#2A2D27] border-gray-700"
              } transition-all duration-300 sticky bottom-0 z-10`}
            >
              <div className="flex items-center gap-2">
                <Tooltip title="Attach Files (Images, Videos, Audio, PDF, Word, Excel, PowerPoint, Text, ZIP)">
                  <IconButton
                    size="small"
                    className={`flex-shrink-0 hover:scale-110 transition-transform duration-300 ${
                      lightTheme ? "hover:bg-gray-100" : "hover:bg-[#3C3D37]"
                    } transition-all duration-300`}
                    onClick={handleAttachClick}
                  >
                    <AttachFileIcon
                      className={lightTheme ? "text-gray-600" : "text-gray-300"}
                      fontSize="small"
                    />
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileChange}
                      accept="image/*,video/*,audio/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain,application/zip,application/x-rar-compressed"
                    />
                  </IconButton>
                </Tooltip>

                {selectedFiles.length > 0 && (
                  <div className="flex flex-row overflow-x-auto space-x-2 h-8 w-full pr-4 absolute left-0 top-[-2.5rem] ml-3 z-20 hide-scrollbar">
                    {selectedFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center text-white bg-gray-200 dark:bg-gray-700 rounded-full px-3 py-1 text-xs shadow border border-gray-300 dark:border-gray-600 cursor-pointer"
                      >
                        <span className="truncate max-w-[80px]">
                          {file.name}
                        </span>
                        <button
                          className="ml-2 text-red-500 hover:text-red-700"
                          onClick={() => handleRemoveFile(idx)}
                          type="button"
                        >
                          <CloseIcon fontSize="small" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <ClickAwayListener onClickAway={handleClickAway}>
                  <div className="relative">
                    <Tooltip title="Emojis">
                      <IconButton
                        size="small"
                        onClick={toggleEmojiPicker}
                        className={`flex-shrink-0 hover:scale-110 transition-transform duration-300 ${
                          lightTheme
                            ? "hover:bg-gray-100"
                            : "hover:bg-[#3C3D37]"
                        } ${
                          showEmojiPicker
                            ? lightTheme
                              ? "bg-gray-200"
                              : "bg-[#4A4B45]"
                            : ""
                        }`}
                        disabled={selectedFiles.length > 0}
                      >
                        <EmojiEmotionsIcon
                          className={
                            lightTheme ? "text-gray-600" : "text-gray-300"
                          }
                          fontSize="small"
                        />
                      </IconButton>
                    </Tooltip>

                    {showEmojiPicker && (
                      <div className="absolute bottom-12 left-0 z-10">
                        <div
                          className={`p-2 rounded-lg shadow-lg ${
                            lightTheme ? "bg-white" : "bg-[#2A2D27]"
                          }`}
                        >
                          <div className="flex justify-between items-center mb-2 px-2">
                            <span
                              className={`text-sm font-medium ${
                                lightTheme ? "text-gray-700" : "text-gray-300"
                              }`}
                            >
                              Emojis
                            </span>
                            <IconButton
                              size="small"
                              onClick={() => setShowEmojiPicker(false)}
                            >
                              <CloseIcon
                                fontSize="small"
                                className={
                                  lightTheme ? "text-gray-500" : "text-gray-400"
                                }
                              />
                            </IconButton>
                          </div>
                          <EmojiPicker
                            onEmojiClick={handleEmojiClick}
                            autoFocusSearch={false}
                            theme={lightTheme ? "light" : "dark"}
                            searchDisabled
                            skinTonesDisabled
                            height={350}
                            width={isSmallScreen ? 250 : 320}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </ClickAwayListener>

                <div className="relative flex-1">
                  <input
                    type="text"
                    value={messageToBeSend}
                    onChange={handleTyping}
                    placeholder="Type a message..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className={`flex-1 w-full p-3 rounded-full outline-none text-base lg:text-lg transition-all ${
                      lightTheme
                        ? "bg-gray-100 text-gray-800 focus:bg-gray-200 focus:shadow-inner"
                        : "bg-[#3C3D37] text-white focus:bg-[#444440] focus:shadow-inner"
                    } transition-all duration-300`}
                    // Prevent keyboard from closing
                    onBlur={(e) => {
                      e.preventDefault();
                      e.target.focus();
                    }}
                    disabled={selectedFiles.length > 0}
                  />
                </div>

                <Tooltip title="Voice Message">
                  <IconButton
                    size="small"
                    className={`flex-shrink-0 hover:scale-110 transition-transform duration-300 ${
                      lightTheme ? "hover:bg-gray-100" : "hover:bg-[#3C3D37]"
                    } transition-all duration-300`}
                    disabled={selectedFiles.length > 0}
                  >
                    <MicIcon
                      className={lightTheme ? "text-gray-600" : "text-gray-300"}
                      fontSize="small"
                    />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Send message" placement="top">
                  <IconButton
                    size={isSmallScreen ? "small" : "medium"}
                    onClick={handleSendMessage}
                    disabled={
                      !messageToBeSend.trim() && selectedFiles.length === 0
                    }
                    className={`${
                      messageToBeSend.trim() || selectedFiles.length > 0
                        ? "opacity-100"
                        : "opacity-60"
                    }`}
                  >
                    <TelegramIcon
                      className={`${
                        messageToBeSend.trim() || selectedFiles.length > 0
                          ? lightTheme
                            ? "text-blue-500"
                            : "text-blue-400"
                          : lightTheme
                            ? "text-gray-400"
                            : "text-gray-500"
                      }`}
                      fontSize={isSmallScreen ? "small" : "medium"}
                    />
                  </IconButton>
                </Tooltip>
              </div>
            </div>
          </div>

          {/* Group Info Side Panel */}
          {isSmallScreen ? (
            // Mobile overlay panel
            <div
              className={`absolute inset-0 z-50 transform transition-transform duration-300 ease-in-out ${
                showGroupInfo ? "translate-x-0" : "translate-x-full"
              }`}
            >
              <div
                className={`absolute inset-0 duration-300 ${
                  showGroupInfo
                    ? "opacity-100"
                    : "opacity-0 pointer-events-none"
                }`}
                onClick={() => setShowGroupInfo(false)}
              />
              <div
                className={`absolute right-0 top-0 h-full w-72 transform transition-transform duration-300 ${
                  showGroupInfo ? "translate-x-0" : "translate-x-full"
                } ${
                  lightTheme
                    ? "bg-white border-l border-gray-200"
                    : "bg-[#2A2D27] border-l border-gray-700"
                } shadow-lg`}
              >
                {/* Close button for mobile */}
                <div className="absolute top-2 right-2 z-10">
                  <IconButton
                    onClick={() => setShowGroupInfo(false)}
                    className={`${
                      lightTheme ? "text-gray-600" : "text-gray-300"
                    } hover:bg-gray-100 dark:hover:bg-gray-700`}
                  >
                    <CloseIcon />
                  </IconButton>
                </div>

                {/* Group Info Content */}
                <div className="p-4 overflow-y-auto h-full">
                  <div className="flex justify-center mb-4">
                    <Avatar
                      alt={groupDetail?.groupName || "Group"}
                      src={groupDetail?.pic}
                      sx={{
                        width: 100,
                        height: 100,
                        border: `3px solid ${
                          lightTheme ? "#3498DB" : "#4DD0E1"
                        }`,
                        bgcolor: lightTheme ? "#f0f7fc" : "#223240",
                        boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
                      }}
                    >
                      {!groupDetail?.pic && (
                        <GroupIcon
                          sx={{
                            fontSize: "3rem",
                            color: lightTheme ? "#3498DB" : "#4DD0E1",
                          }}
                        />
                      )}
                    </Avatar>
                  </div>

                  <Typography
                    variant="h6"
                    align="center"
                    className={`font-semibold ${
                      lightTheme ? "text-gray-800" : "text-white"
                    }`}
                  >
                    {groupDetail?.groupName || "Group Name"}
                  </Typography>

                  <Typography
                    variant="body2"
                    align="center"
                    className={`mt-1 ${
                      lightTheme ? "text-gray-600" : "text-gray-300"
                    }`}
                  >
                    Created on {formatDate(groupDetail?.createdAt)}
                  </Typography>

                  <Box
                    className={`mt-4 p-3 rounded-lg ${
                      lightTheme ? "bg-gray-50" : "bg-[#3C3D37]"
                    }`}
                  >
                    <Typography
                      variant="body2"
                      className={lightTheme ? "text-gray-700" : "text-gray-200"}
                    >
                      {groupDetail?.groupDescription ||
                        "No description provided."}
                    </Typography>
                  </Box>

                  <Divider className="my-4" />

                  <div className="flex justify-between items-center mt-3 mb-3">
                    <Typography
                      variant="subtitle1"
                      className={`font-medium ${
                        lightTheme ? "text-gray-800" : "text-white"
                      }`}
                    >
                      Members ({memberList.length})
                    </Typography>

                    <Button
                      startIcon={<PersonAddIcon />}
                      size="small"
                      variant="outlined"
                      onClick={() => setOpenAddMemberDialog(true)}
                      className={`text-xs ${
                        lightTheme ? "" : "border-gray-600 text-gray-300"
                      }`}
                    >
                      Add
                    </Button>
                  </div>

                  <List
                    className={`${
                      lightTheme ? "bg-gray-50" : "bg-[#3C3D37]"
                    } rounded-lg overflow-y-auto no-scrollbar max-h-[250px]`}
                  >
                    {memberList.map((member) => (
                      <ListItem
                        key={member._id}
                        className={`mb-1 rounded-lg ${
                          lightTheme
                            ? "hover:bg-gray-100"
                            : "hover:bg-[#4A4B45]"
                        }`}
                      >
                        <ListItemAvatar>
                          <Avatar src={member.pic} alt={member.name}>
                            {member.name.charAt(0)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <div className="flex items-center">
                              <span
                                className={
                                  lightTheme ? "text-gray-800" : "text-white"
                                }
                              >
                                {member.name}
                              </span>
                              {admins.includes(member._id) && (
                                <Tooltip title="Admin">
                                  <AdminPanelSettingsIcon
                                    fontSize="small"
                                    className="ml-1 text-blue-500"
                                  />
                                </Tooltip>
                              )}
                            </div>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Tooltip title="Make Admin">
                            <IconButton
                              edge="end"
                              size="small"
                              onClick={() => handleMakeAdmin(member._id)}
                              disabled={admins.includes(member._id)}
                              className={`mr-1 ${
                                admins.includes(member._id)
                                  ? "opacity-50"
                                  : "opacity-100"
                              }`}
                            >
                              <AdminPanelSettingsIcon
                                fontSize="small"
                                className={
                                  lightTheme ? "text-blue-500" : "text-blue-400"
                                }
                              />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Remove Member">
                            <IconButton
                              edge="end"
                              size="small"
                              onClick={() => handleRemoveMember(member._id)}
                            >
                              <DeleteIcon
                                fontSize="small"
                                className={
                                  lightTheme ? "text-red-500" : "text-red-400"
                                }
                              />
                            </IconButton>
                          </Tooltip>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>

                  {/* Leave Group Button - Mobile */}
                  <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    startIcon={<ExitToApp />}
                    onClick={() => handleLeaveGroup()}
                    className={`mt-6 ${
                      lightTheme
                        ? "border-red-500 text-red-500"
                        : "border-red-400 text-red-400"
                    } hover:bg-red-50 dark:hover:bg-red-900/30`}
                  >
                    Leave Group
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            // Desktop side panel
            <Collapse in={showGroupInfo} orientation="horizontal">
              <div
                className={`w-72 border-l ${
                  lightTheme
                    ? "bg-white border-gray-200"
                    : "bg-[#2A2D27] border-gray-700"
                } flex flex-col max-h-[100vh] `}
              >
                <div className="p-4 overflow-y-auto flex-grow no-scrollbar">
                  <div className="flex justify-center mb-4">
                    <Avatar
                      alt={groupDetail?.groupName || "Group"}
                      src={groupDetail?.pic}
                      sx={{
                        width: 100,
                        height: 100,
                        border: `3px solid ${
                          lightTheme ? "#3498DB" : "#4DD0E1"
                        }`,
                        bgcolor: lightTheme ? "#f0f7fc" : "#223240",
                        boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
                      }}
                    >
                      {!groupDetail?.pic && (
                        <GroupIcon
                          sx={{
                            fontSize: "3rem",
                            color: lightTheme ? "#3498DB" : "#4DD0E1",
                          }}
                        />
                      )}
                    </Avatar>
                  </div>

                  <Typography
                    variant="h6"
                    align="center"
                    className={`font-semibold ${
                      lightTheme ? "text-gray-800" : "text-white"
                    }`}
                  >
                    {groupDetail?.groupName || "Group Name"}
                  </Typography>

                  <Typography
                    variant="body2"
                    align="center"
                    className={`mt-1 ${
                      lightTheme ? "text-gray-600" : "text-gray-300"
                    }`}
                  >
                    Created on {formatDate(groupDetail?.createdAt)}
                  </Typography>

                  <Box
                    className={`mt-4 p-3 rounded-lg ${
                      lightTheme ? "bg-gray-50" : "bg-[#3C3D37]"
                    }`}
                  >
                    <Typography
                      variant="body2"
                      className={lightTheme ? "text-gray-700" : "text-gray-200"}
                    >
                      {groupDetail?.groupDescription ||
                        "No description provided."}
                    </Typography>
                  </Box>

                  <Divider className="my-4" />

                  <div className="flex justify-between items-center mt-3 mb-3">
                    <Typography
                      variant="subtitle1"
                      className={`font-medium ${
                        lightTheme ? "text-gray-800" : "text-white"
                      }`}
                    >
                      Members ({memberList.length})
                    </Typography>

                    <Button
                      startIcon={<PersonAddIcon />}
                      size="small"
                      variant="outlined"
                      onClick={() => setOpenAddMemberDialog(true)}
                      className={`text-xs ${
                        lightTheme ? "" : "border-gray-600 text-gray-300"
                      }`}
                    >
                      Add
                    </Button>
                  </div>

                  <List
                    className={`${
                      lightTheme ? "bg-gray-50" : "bg-[#3C3D37]"
                    } rounded-lg overflow-y-auto no-scrollbar max-h-[200px]`}
                  >
                    {memberList.map((member) => (
                      <ListItem
                        key={member._id}
                        className={`mb-1 rounded-lg ${
                          lightTheme
                            ? "hover:bg-gray-100"
                            : "hover:bg-[#4A4B45]"
                        }`}
                      >
                        <ListItemAvatar>
                          <Avatar src={member.pic} alt={member.name}>
                            {member.name.charAt(0)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <div className="flex items-center">
                              <span
                                className={
                                  lightTheme ? "text-gray-800" : "text-white"
                                }
                              >
                                {member.name}
                              </span>
                              {admins.includes(member._id) && (
                                <Tooltip title="Admin">
                                  <AdminPanelSettingsIcon
                                    fontSize="small"
                                    className="ml-1 text-blue-500"
                                  />
                                </Tooltip>
                              )}
                            </div>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Tooltip title="Make Admin">
                            <IconButton
                              edge="end"
                              size="small"
                              onClick={() => handleMakeAdmin(member._id)}
                              disabled={admins.includes(member._id)}
                              className={`mr-1 ${
                                admins.includes(member._id)
                                  ? "opacity-50"
                                  : "opacity-100"
                              }`}
                            >
                              <AdminPanelSettingsIcon
                                fontSize="small"
                                className={
                                  lightTheme ? "text-blue-500" : "text-blue-400"
                                }
                              />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Remove Member">
                            <IconButton
                              edge="end"
                              size="small"
                              onClick={() => handleRemoveMember(member._id)}
                            >
                              <DeleteIcon
                                fontSize="small"
                                className={
                                  lightTheme ? "text-red-500" : "text-red-400"
                                }
                              />
                            </IconButton>
                          </Tooltip>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>

                  {/* Leave Group Button - Desktop */}
                  <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    startIcon={<ExitToApp />}
                    onClick={() => handleLeaveGroup()}
                    className={`mt-6 ${
                      lightTheme
                        ? "border-red-500 text-red-500"
                        : "border-red-400 text-red-400"
                    } hover:bg-red-50 dark:hover:bg-red-900/30`}
                  >
                    Leave Group
                  </Button>
                </div>
              </div>
            </Collapse>
          )}
        </div>
      </div>

      {openAddMemberDialog && (
        <Dialog
          open={openAddMemberDialog}
          onClose={() => setOpenAddMemberDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Add Members</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Search Users"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />

            {/* Selected Users Section */}
            {selectedUsers.length > 0 && (
              <Box className="mb-4">
                <Typography
                  variant="body2"
                  className={`mb-2 ${
                    lightTheme ? "text-gray-600" : "text-gray-300"
                  }`}
                >
                  Selected Users ({selectedUsers.length})
                </Typography>
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map((user) => (
                    <Chip
                      key={user._id}
                      avatar={<Avatar alt={user.name} src={user.pic} />}
                      label={user.name}
                      onDelete={() => handleRemoveSelectedUser(user._id)}
                      sx={{ borderRadius: "8px", padding: "2px 0" }}
                    />
                  ))}
                </div>
              </Box>
            )}

            <div className="mt-4">
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
                  {searchQuery.trim() ? (
                    <>No users found matching "{searchQuery}"</>
                  ) : (
                    "Start typing to search for users"
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredUsers.map((user) => (
                    <div
                      key={user._id}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-gray-100 ${
                        lightTheme ? "" : "hover:bg-gray-800"
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
                              lightTheme ? "text-gray-800" : "text-white"
                            }`}
                          >
                            {user.name}
                          </Typography>
                          <Typography
                            variant="body2"
                            className={`text-gray-500 ${
                              lightTheme ? "" : "text-gray-400"
                            }`}
                          >
                            @{user.username}
                          </Typography>
                        </div>
                      </div>
                      <Add
                        className={`${
                          lightTheme ? "text-gray-600" : "text-gray-300"
                        } hover:text-blue-500`}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAddMemberDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddMembersToGroup}
              variant="contained"
              disabled={selectedUsers.length === 0}
            >
              Add Members
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <Dialog
        open={openRemoveConfirmDialog}
        onClose={() => setOpenRemoveConfirmDialog(false)}
        PaperProps={{
          className: lightTheme ? "" : "bg-[#3C3D37] text-white",
        }}
      >
        <DialogTitle>Remove Member</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove this member from the group?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenRemoveConfirmDialog(false)}
            className={lightTheme ? "" : "text-gray-300"}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmRemove}
            variant="contained"
            color="error"
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>

      {/* Make Admin Confirmation Dialog */}
      <Dialog
        open={openMakeAdminConfirmDialog}
        onClose={() => setOpenMakeAdminConfirmDialog(false)}
        PaperProps={{
          className: lightTheme ? "" : "bg-[#3C3D37] text-white",
        }}
      >
        <DialogTitle>Make Admin</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to make this member an admin of the group?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenMakeAdminConfirmDialog(false)}
            className={lightTheme ? "" : "text-gray-300"}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmMakeAdmin}
            variant="contained"
            color="primary"
          >
            Make Admin
          </Button>
        </DialogActions>
      </Dialog>

      {/* Leave Group Confirmation Dialog */}
      <Dialog
        open={openLeaveGroupConfirmDialog}
        onClose={() => setOpenLeaveGroupConfirmDialog(false)}
        PaperProps={{
          className: lightTheme ? "" : "bg-[#3C3D37] text-white",
        }}
      >
        <DialogTitle>Leave Group</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to leave this group? You will no longer have
            access to its messages and members.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenLeaveGroupConfirmDialog(false)}
            className={lightTheme ? "" : "text-gray-300"}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmLeaveGroup}
            variant="contained"
            color="error"
          >
            Leave Group
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default GroupChatArea;
