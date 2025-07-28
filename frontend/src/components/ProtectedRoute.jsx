import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";

import axios from "axios";
import api from "../config/api";

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get("/user/check-auth", {
          withCredentials: true,
        });
        setIsAuthenticated(res.data.success); // true or false
      } catch (err) {
        // If authentication fails, remove the invalid token from localStorage
        localStorage.removeItem("addatoken");
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <CircularProgress
          size={60}
          sx={{
            color: "white",
            "& .MuiCircularProgress-circle": {
              strokeLinecap: "round",
            },
          }}
        />
      </Box>
    );
  }

  return isAuthenticated ? (
    children
  ) : (
    // Redirect to login page if authentication fails
    // Invalid addatoken is already removed in the catch block above
    <Navigate to="/" replace state={{ message: "Please login first" }} />
  );
  //   return isAuthenticated ? children : navigate("/");
};

export default ProtectedRoute;
