import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Paper,
} from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import AlternateEmailIcon from "@mui/icons-material/AlternateEmail";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import defaultProfile from "../assets/profile.webp";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import api from "../config/api";
import "react-toastify/dist/ReactToastify.css";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [logoutMessage, setLogoutMessage] = useState(location.state);
  const [showPassword, setShowPassword] = useState(false);
  const [showConPass, setShowConPass] = useState(false);
  const [redirectMessage, setRedirectMessage] = useState(
    location.state?.message
  );
  const [isSignUp, setIsSignUp] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleConPassVisivility = () => {
    setShowConPass((prev) => !prev);
  };

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    pic: "",
  });

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        navigate("/app/welcome");
      }
    } catch (error) {
      toast.error("Something went wrong", { position: "top-right" });
    }
  }, []);

  useEffect(() => {
    if (redirectMessage) {
      toast.info(redirectMessage, { position: "top-right" });
      navigate(location.pathname, { replace: true });
    }
  }, [redirectMessage]);

  useEffect(() => {
    if (logoutMessage) {
      toast.success(location.state.toastMessage, { position: "top-right" });
      navigate(location.pathname, { replace: true });
    }
  }, [logoutMessage]);

  const handleProfilePicChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setProfilePic(URL.createObjectURL(file));
      setFormData({ ...formData, ["pic"]: file });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const loginHandler = async () => {
    try {
      toast.info("Loging you up please wait..", {
        position: "top-right",
        toastId: "signup-toast",
      });
      const { data } = await api.post(
        "/user/login", // or /signup
        formData,
        { withCredentials: true }
      );

      localStorage.setItem("token", data.token);
      navigate("/app/welcome", { state: { toastMessage: data.message } });
    } catch (error) {
      console.log(error.response);
      const errorMessage = error.response?.data?.message || "Login failed!";
      toast.error(errorMessage, { position: "top-right" });
    }
  };

  const signUpHandler = async () => {
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!", { position: "top-right" });
      return;
    }

    toast.info("Signing you up please wait..", {
      position: "top-right",
      toastId: "signup-toast",
      autoClose: 15000, // prevents duplicate toasts
    });
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("username", formData.username);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("password", formData.password);
      formDataToSend.append("confirmPassword", formData.confirmPassword);
      if (formData.pic) {
        formDataToSend.append("pic", formData.pic); // pic is the image file
      }

      const { data } = await api.post("/user/signup", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      localStorage.setItem("token", data.token);

      navigate("/app/welcome", { state: { toastMessage: data.message } });
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Signup failed!";

      toast.error(errorMessage, { position: "top-right" });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <Paper
        elevation={8}
        className="rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 my-8 bg-white transition-all duration-300"
        sx={{
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
        }}
      >
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold mb-1 text-gray-800">
            Welcome to{" "}
            <span className="text-blue-600 font-extrabold">Adda</span>
          </h1>
          <p className="text-gray-500 text-sm">
            {isSignUp
              ? "Create an account to get started"
              : "Sign in to continue to your account"}
          </p>
        </div>

        {isSignUp && (
          <div className="flex flex-col items-center mb-4">
            <div className="relative w-24 h-24">
              <div className="w-full h-full rounded-full overflow-hidden border-4 border-blue-100 shadow-md">
                <img
                  src={profilePic || defaultProfile}
                  className="w-full h-full object-cover"
                  alt="Profile"
                />
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="profile-upload"
                onChange={handleProfilePicChange}
              />
              <label
                htmlFor="profile-upload"
                className="absolute bottom-0 right-0 bg-blue-500 p-1.5 rounded-full cursor-pointer hover:bg-blue-600 transform hover:scale-110 transition-all duration-300 shadow-sm"
              >
                <PhotoCameraIcon fontSize="small" className="text-white" />
              </label>
            </div>
            <p className="text-gray-500 text-xs mt-1">Add a profile picture</p>
          </div>
        )}

        <div className="flex flex-col gap-7 w-full">
          {isSignUp && (
            <>
              <TextField
                label="Full Name"
                variant="outlined"
                fullWidth
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineIcon
                        className="text-gray-500"
                        fontSize="small"
                      />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    "& fieldset": {
                      borderColor: "rgba(0, 0, 0, 0.15)",
                    },
                    "&:hover fieldset": {
                      borderColor: "#3b82f6",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#3b82f6",
                    },
                  },
                }}
              />
              <TextField
                label="Username"
                variant="outlined"
                fullWidth
                required
                name="username"
                value={formData.username}
                onChange={handleChange}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeOutlinedIcon
                        className="text-gray-500"
                        fontSize="small"
                      />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    "& fieldset": {
                      borderColor: "rgba(0, 0, 0, 0.15)",
                    },
                    "&:hover fieldset": {
                      borderColor: "#3b82f6",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#3b82f6",
                    },
                  },
                }}
              />
            </>
          )}
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            required
            name="email"
            value={formData.email}
            onChange={handleChange}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AlternateEmailIcon
                    className="text-gray-500"
                    fontSize="small"
                  />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
                "& fieldset": {
                  borderColor: "rgba(0, 0, 0, 0.15)",
                },
                "&:hover fieldset": {
                  borderColor: "#3b82f6",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#3b82f6",
                },
              },
            }}
          />
          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            variant="outlined"
            fullWidth
            required
            name="password"
            value={formData.password}
            onChange={handleChange}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlinedIcon
                    className="text-gray-500"
                    fontSize="small"
                  />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={togglePasswordVisibility}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? (
                      <VisibilityOff
                        className="text-gray-500"
                        fontSize="small"
                      />
                    ) : (
                      <Visibility className="text-gray-500" fontSize="small" />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
                "& fieldset": {
                  borderColor: "rgba(0, 0, 0, 0.15)",
                },
                "&:hover fieldset": {
                  borderColor: "#3b82f6",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#3b82f6",
                },
              },
            }}
          />
          {isSignUp && (
            <TextField
              label="Confirm Password"
              type={showConPass ? "text" : "password"}
              variant="outlined"
              fullWidth
              required
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon
                      className="text-gray-500"
                      fontSize="small"
                    />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={toggleConPassVisivility}
                      edge="end"
                      size="small"
                    >
                      {showConPass ? (
                        <VisibilityOff
                          className="text-gray-500"
                          fontSize="small"
                        />
                      ) : (
                        <Visibility
                          className="text-gray-500"
                          fontSize="small"
                        />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  "& fieldset": {
                    borderColor: "rgba(0, 0, 0, 0.15)",
                  },
                  "&:hover fieldset": {
                    borderColor: "#3b82f6",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#3b82f6",
                  },
                },
              }}
            />
          )}
        </div>

        {!isSignUp && (
          <p className="text-right text-xs mt-2 text-blue-600 cursor-pointer hover:text-blue-800 font-medium transition-all duration-300">
            Forgot Password?
          </p>
        )}

        <div className="mt-4">
          <Button
            variant="contained"
            fullWidth
            className="py-2 rounded-lg"
            sx={{
              textTransform: "none",
              fontSize: "14px",
              fontWeight: "600",
              borderRadius: "10px",
              boxShadow: "0 4px 6px -1px rgba(59, 130, 246, 0.3)",
              background: "linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)",
              "&:hover": {
                background: "linear-gradient(90deg, #2563eb 0%, #4f46e5 100%)",
                boxShadow: "0 10px 15px -3px rgba(59, 130, 246, 0.4)",
              },
              transition: "all 0.2s ease",
            }}
            onClick={isSignUp ? signUpHandler : loginHandler}
          >
            {isSignUp ? "Create Account" : "Sign In"}
          </Button>
        </div>

        <div className="flex items-center justify-center my-4">
          <div className="flex-1 h-px bg-gray-200"></div>
          <p className="px-3 text-xs text-gray-500">OR</p>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        <p className="text-center text-xs text-gray-600">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}
          <span
            className="text-blue-600 font-medium cursor-pointer hover:text-blue-800 ml-1 transition-all duration-300"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? "Sign In" : "Create Account"}
          </span>
        </p>
      </Paper>

      {/* Toast Container */}
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
      />
      <div className="fixed bottom-2 right-2">
        <p className="text-xs font-medium text-gray-600 bg-white bg-opacity-80 px-2 py-1 rounded-full shadow-sm">
          made with ❤️ by Suman
        </p>
      </div>
    </div>
  );
};

export default Auth;
