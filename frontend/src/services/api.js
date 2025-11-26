import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.REACT_APP_API_URL || "https://eventopia-1-5.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor - cookies are automatically sent with requests
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
