import axios from "axios";

const api = axios.create({
  baseURL: "https://eventopia-1-5.onrender.com",
  
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});
console.log('API baseURL =', baseURL);
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
