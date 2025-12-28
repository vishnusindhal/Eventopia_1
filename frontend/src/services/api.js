import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  
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
