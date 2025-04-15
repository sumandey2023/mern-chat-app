import React, { useState, useEffect } from "react";
import { TextField, Button, InputAdornment, IconButton } from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import defaultProfile from "../assets/profile.webp";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import axios from "axios";
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
  //test
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
      const { data } = await axios.post(
        "http://localhost:5000/user/login", // or /signup
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

      const { data } = await axios.post(
        "http://localhost:5000/user/signup",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      localStorage.setItem("token", data.token);

      navigate("/app/welcome", { state: { toastMessage: data.message } });
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Signup failed!";

      toast.error(errorMessage, { position: "top-right" });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="rounded-2xl shadow-xl p-8 w-full max-w-sm bg-white transition-all duration-300">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Welcome to <span className="text-blue-500">Adda</span>
        </h1>

        {isSignUp && (
          <div className="flex flex-col items-center mb-4">
            <div className="relative w-24 h-24">
              <img
                src={profilePic || defaultProfile}
                className="w-full h-full rounded-full object-cover border-2 border-gray-300 shadow-md"
              />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="profile-upload"
                onChange={handleProfilePicChange}
              />
              <label
                htmlFor="profile-upload"
                className="absolute bottom-0 right-0 bg-gray-200 p-1 rounded-full cursor-pointer hover:scale-110 transition-transform duration-300"
              >
                <PhotoCameraIcon fontSize="small" className="text-gray-600" />
              </label>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4 w-full">
          {isSignUp && (
            <>
              <TextField
                label="Name"
                variant="outlined"
                fullWidth
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "rgba(0, 0, 0, 0.23)",
                    },
                    "&:hover fieldset": {
                      borderColor: "#1976d2",
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
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "rgba(0, 0, 0, 0.23)",
                    },
                    "&:hover fieldset": {
                      borderColor: "#1976d2",
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
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "rgba(0, 0, 0, 0.23)",
                },
                "&:hover fieldset": {
                  borderColor: "#1976d2",
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
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "rgba(0, 0, 0, 0.23)",
                },
                "&:hover fieldset": {
                  borderColor: "#1976d2",
                },
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={togglePasswordVisibility} edge="end">
                    {showPassword ? (
                      <VisibilityOff className="text-gray-600" />
                    ) : (
                      <Visibility className="text-gray-600" />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
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
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "rgba(0, 0, 0, 0.23)",
                  },
                  "&:hover fieldset": {
                    borderColor: "#1976d2",
                  },
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={toggleConPassVisivility} edge="end">
                      {showConPass ? (
                        <VisibilityOff className="text-gray-600" />
                      ) : (
                        <Visibility className="text-gray-600" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          )}
        </div>

        {!isSignUp && (
          <p className="text-right text-sm mt-2 text-blue-500 cursor-pointer hover:underline transition-all duration-300">
            Forgot Password?
          </p>
        )}

        <div className="mt-6">
          <Button
            variant="contained"
            color="primary"
            fullWidth
            className="py-3 text-lg rounded-lg shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
            sx={{
              textTransform: "none",
              background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
              "&:hover": {
                background: "linear-gradient(45deg, #1976D3 30%, #1A8BC3 90%)",
              },
            }}
            onClick={isSignUp ? signUpHandler : loginHandler}
          >
            {isSignUp ? "Sign Up" : "Login"}
          </Button>
        </div>

        <p className="text-center mt-4 text-sm text-gray-600">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}
          <span
            className="text-blue-500 cursor-pointer hover:underline ml-1 transition-all duration-300"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? "Login" : "Sign up"}
          </span>
        </p>
      </div>

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
        theme="colored"
      />
      <h4 class="fixed bottom-2 right-2 text-lg ">made with ❤️ by Suman</h4>
    </div>
  );
};

export default Auth;
