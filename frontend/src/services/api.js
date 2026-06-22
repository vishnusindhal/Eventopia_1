import axios from "axios";
import { API_URL } from "../config/api";

// In development, log which backend we are talking to so you can instantly
// verify that the correct environment file is being picked up.
if (import.meta.env.DEV) {
  console.info(`[Eventopia] API baseURL → ${API_URL}`);
}

const api = axios.create({
  baseURL: API_URL,
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
    // Only redirect for 401s that are not from the auth endpoints used by the app to check session
    if (error.response?.status === 401) {
      // remove Authorization header if present
      try {
        delete api.defaults.headers.common['Authorization'];
      } catch (e) {
        // ignore
      }

      const reqUrl = error.config?.url || '';
      const isAuthRequest = reqUrl.includes('/auth');

      // If the 401 came from an auth-related check (e.g., GET /auth/me), let the calling code handle it
      if (isAuthRequest) {
        return Promise.reject(error);
      }

      const pathname = window.location.pathname || '';
      const isLoginPath = pathname === '/login' || pathname === '/admin-login' || pathname.startsWith('/login') || pathname.startsWith('/admin-login');

      // prevent multiple redirects by using a window flag
      if (!isLoginPath && !window.__apiRedirectingToLogin) {
        window.__apiRedirectingToLogin = true;
        // use replace so history isn't cluttered
        window.location.replace('/login');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
