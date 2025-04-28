// const BASE_URL = "http://localhost:5000";
const BASE_URL = "https://adda-db.onrender.com";

// Create axios instance with credentials
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
