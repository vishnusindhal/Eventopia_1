import axios from 'axios';

// Create axios instance with base URL
// Vite exposes env vars via import.meta.env and requires the VITE_ prefix for client-side use.
// Use VITE_API_URL to point to the backend (e.g. https://your-backend.com/api). If not provided
// we fallback to '/api' which will proxy to the backend when developing with a proxy or
// hit the backend when the frontend and backend are served from the same origin under /api.
const api = axios.create({
  baseURL: import.meta.env.REACT_APP_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
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
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;