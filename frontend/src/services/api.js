import axios from 'axios';

// Create axios instance with base URL
// Vite exposes env vars via import.meta.env and requires the VITE_ prefix for client-side use.
// Use VITE_API_URL to point to the backend (e.g. https://your-backend.com/api). If not provided
// we fallback to '/api' which will proxy to the backend when developing with a proxy or
// hit the backend when the frontend and backend are served from the same origin under /api.
const api = axios.create({
  baseURL: "https://eventopia-1-5.onrender.com/api",
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Enable sending cookies with requests
});

// Request interceptor - cookies are automatically sent with requests
api.interceptors.request.use(
  (config) => {
    // Cookies are automatically included when withCredentials is true
    // No need to manually add Authorization header
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - redirect to login
      // The server should clear the cookie on logout/token expiry
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;