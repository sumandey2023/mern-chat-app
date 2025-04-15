import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import axios from "axios";

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get("http://localhost:5000/user/check-auth", {
          withCredentials: true,
        });
        setIsAuthenticated(res.data.success); // true or false
      } catch (err) {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) return <></>;

  return isAuthenticated ? (
    children
  ) : (
    <Navigate to="/" replace state={{ message: "Please login first" }} />
  );
  //   return isAuthenticated ? children : navigate("/");
};

export default ProtectedRoute;
