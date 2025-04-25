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
} from "@mui/material";
import {
  Search,
  Add,
  ExpandMore,
  ExpandLess,
  Group as GroupIcon,
} from "@mui/icons-material";
import { useMediaQuery } from "react-responsive";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import api from "../../config/axios";
import EmojiPicker from "emoji-picker-react";
import { io } from "socket.io-client";
import BASE_URL from "../../config/api";
import { format } from "date-fns";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState({});

  // Placeholder for member list (would be populated from groupDetail.members in real implementation)
  const [memberList, setMemberList] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [allMessages, setAllMessages] = useState([]);

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

      if (res.ok) {
        const result = await res.json();
        // Filter out users who are already members of the group
        const filteredResult = result.filter(
          (user) =>
            !groupDetail.members?.some((member) => member._id === user._id)
        );
        setFilteredUsers(filteredResult);
      } else {
        console.error("Failed to fetch users");
        setFilteredUsers([]);
      }
    } catch (error) {
      console.error("Error searching users:", error);
      setFilteredUsers([]);
    }
  };

  const handleAddUser = (user) => {
    if (selectedUsers.some((u) => u._id === user._id)) {
      return; // User already selected
    }
    setSelectedUsers([...selectedUsers, user]);
    setSearchQuery("");
  };

  const handleRemoveSelectedUser = (userId) => {
    setSelectedUsers(selectedUsers.filter((u) => u._id !== userId));
  };

  const handleAddMembersToGroup = async () => {
    // This would be connected to backend API later
    console.log("Adding members:", selectedUsers);

    // Close dialog and reset selection
    setOpenAddMemberDialog(false);
    setSelectedUsers([]);
    setSearchQuery("");
  };

  const handleRemoveMember = (memberId) => {
    // This would be connected to backend API later
    console.log("Removing member:", memberId);
  };

  const handleMakeAdmin = (memberId) => {
    // This would be connected to backend API later
    console.log("Making admin:", memberId);
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

  const handleSendMessage = async () => {
    try {
      const sendMessageData = await api.post(
        `/group/sendMessage/${id}`,
        {
          message: messageToBeSend,
        },
        {
          withCredentials: true,
        }
      );

      setMessageToBeSend(""); // Clear the input field after sending
      console.log("Message sent:", sendMessageData.data);
    } catch (error) {
      console.error("Error sending message:", error);
    }
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

  return (
    <div
      className={`grow py-4 px-3 h-full transition-colors duration-300 ${
        lightTheme ? "bg-gray-100" : "bg-[#181C14]"
      } transition-all duration-300`}
    >
      <div
        className={`flex flex-col h-full rounded-2xl shadow-lg overflow-hidden transition-colors duration-300 ${
          lightTheme ? "bg-white" : "bg-[#3C3D37]"
        } transition-all duration-300`}
      >
        {console.log(allMessages)}
        {/* Header */}
        <div
          className={`flex items-center justify-between px-4 py-3 border-b transition-colors duration-300 ${
            lightTheme
              ? "bg-white border-gray-200"
              : "bg-[#2A2D27] border-gray-700"
          } transition-all duration-300`}
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

        <div className="flex flex-1 overflow-hidden">
          {/* Main chat area */}
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Chat Messages Area with Fixed Scrollbar */}
            <div
              className={`flex-1 p-3 lg:p-4 overflow-y-auto chat-container scroll-smooth no-scrollbar ${
                lightTheme
                  ? "bg-gray-50"
                  : "bg-gradient-to-b from-[#2A2D27] to-[#323329]"
              } transition-all duration-300`}
              style={{
                overflowY: "auto",
              }}
            >
              {/* Message content will go here */}
              {console.log(loggedInUser)}
              {allMessages.map((message) => {
                {
                  console.log(message);
                }
                return (
                  <div key={message._id}>
                    {message.senderId === loggedInUser._id ? (
                      <MessageSelf text={message.text} />
                    ) : (
                      <MessageOther
                        // key={`msg-${index}`}
                        text={message.text}
                        // pic={receiverData?.pic}
                        // time={time}
                      />
                    )}
                  </div>
                );
              })}
              <div ref={scrollRef} />
            </div>

            {/* Input area */}
            <div
              className={`px-3 py-2 border-t transition-colors duration-300 ${
                lightTheme
                  ? "bg-white border-gray-200"
                  : "bg-[#2A2D27] border-gray-700"
              } transition-all duration-300`}
            >
              <div className="flex items-center gap-2">
                <Tooltip title="Attach File">
                  <IconButton
                    size="small"
                    className={`flex-shrink-0 hover:scale-110 transition-transform duration-300 ${
                      lightTheme ? "hover:bg-gray-100" : "hover:bg-[#3C3D37]"
                    } transition-all duration-300`}
                  >
                    <AttachFileIcon
                      className={lightTheme ? "text-gray-600" : "text-gray-300"}
                      fontSize="small"
                    />
                  </IconButton>
                </Tooltip>

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
                    onChange={(e) => setMessageToBeSend(e.target.value)}
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
                  />
                </div>

                <Tooltip title="Voice Message">
                  <IconButton
                    size="small"
                    className={`flex-shrink-0 hover:scale-110 transition-transform duration-300 ${
                      lightTheme ? "hover:bg-gray-100" : "hover:bg-[#3C3D37]"
                    } transition-all duration-300`}
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
                    disabled={!messageToBeSend.trim()}
                    className={`${
                      messageToBeSend.trim() ? "opacity-100" : "opacity-60"
                    }`}
                  >
                    <TelegramIcon
                      className={`${
                        messageToBeSend.trim()
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
          {/* <Collapse in={showGroupInfo} orientation="horizontal">
            <div
              className={`w-72 border-l overflow-y-auto ${
                lightTheme
                  ? "bg-white border-gray-200"
                  : "bg-[#2A2D27] border-gray-700"
              } transition-all duration-300`}
            >
              <div className="p-4">
                <div className="flex justify-center mb-4">
                  <Avatar
                    alt={groupDetail?.groupName || "Group"}
                    src={groupDetail?.pic}
                    sx={{
                      width: 100,
                      height: 100,
                      border: `3px solid ${lightTheme ? "#3498DB" : "#4DD0E1"}`,
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

                <Divider className="my-4 " />

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
                  } rounded-lg no-scrollbar overflow-y-auto max-h-80`} // <-- changed to a valid height
                >
                  {console.log(memberList)}
                  {memberList.map((member) => (
                    <ListItem
                      key={member._id}
                      className={`mb-1 rounded-lg ${
                        lightTheme ? "hover:bg-gray-100" : "hover:bg-[#4A4B45]"
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
                            disabled={member._id}
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
              </div>
            </div>
          </Collapse> */}

          <Collapse in={showGroupInfo} orientation="horizontal">
            <div
              className={`w-72 border-l ${
                lightTheme
                  ? "bg-white border-gray-200"
                  : "bg-[#2A2D27] border-gray-700"
              } flex flex-col max-h-[100vh]`}
            >
              <div className="p-4 overflow-y-auto flex-grow">
                <div className="flex justify-center mb-4">
                  <Avatar
                    alt={groupDetail?.groupName || "Group"}
                    src={groupDetail?.pic}
                    sx={{
                      width: 100,
                      height: 100,
                      border: `3px solid ${lightTheme ? "#3498DB" : "#4DD0E1"}`,
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

                <Divider className="my-4 " />

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
                        lightTheme ? "hover:bg-gray-100" : "hover:bg-[#4A4B45]"
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
              </div>
            </div>
          </Collapse>
        </div>
      </div>

      {/* Add Members Dialog */}
      <Dialog
        open={openAddMemberDialog}
        onClose={() => setOpenAddMemberDialog(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          className: lightTheme ? "" : "bg-[#3C3D37] text-white",
        }}
      >
        <DialogTitle>Add Members to Group</DialogTitle>
        <DialogContent>
          <TextField
            label="Search Users"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            margin="dense"
            placeholder="Search by name or email"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              className: lightTheme ? "" : "text-white",
            }}
            sx={{
              mb: 3,
              "& .MuiOutlinedInput-root": { borderRadius: "12px" },
              "& .MuiOutlinedInput-input": { padding: "14px" },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: lightTheme ? undefined : "rgba(255,255,255,0.3)",
              },
            }}
          />

          {selectedUsers.length > 0 && (
            <Box className="mb-3">
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

          {searchQuery && filteredUsers.length > 0 && (
            <Box
              className={`max-h-52 overflow-y-auto mb-2 rounded-xl p-2 ${
                lightTheme ? "bg-gray-50" : "bg-[#181C14]"
              }`}
            >
              {filteredUsers.map((user) => (
                <div
                  key={user._id}
                  className={`flex items-center justify-between p-3 mb-1 rounded-lg cursor-pointer ${
                    lightTheme ? "hover:bg-gray-200" : "hover:bg-gray-800"
                  }`}
                  onClick={() => handleAddUser(user)}
                >
                  <div className="flex items-center">
                    <Avatar className="mr-2 w-8 h-8">
                      <img
                        src={user.pic}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    </Avatar>
                    <div>
                      <Typography
                        className={
                          lightTheme ? "font-medium" : "font-medium text-white"
                        }
                      >
                        {user.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        className={
                          lightTheme ? "text-gray-500" : "text-gray-400"
                        }
                      >
                        @{user.username || user.email}
                      </Typography>
                    </div>
                  </div>
                  <Add className={lightTheme ? "" : "text-white"} />
                </div>
              ))}
            </Box>
          )}

          {searchQuery && filteredUsers.length === 0 && (
            <Box className="text-center p-3 mb-2">
              <Typography
                className={lightTheme ? "text-gray-500" : "text-gray-400"}
              >
                No users found
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddMemberDialog(false)}>Cancel</Button>
          <Button
            onClick={handleAddMembersToGroup}
            variant="contained"
            disabled={selectedUsers.length === 0}
          >
            Add to Group
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default GroupChatArea;
