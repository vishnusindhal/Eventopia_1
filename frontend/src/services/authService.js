import api from './api';

let currentUser = null;

// Register user
export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    if (response.data.user) {
      currentUser = response.data.user;
    }
    // If backend returned a token, set default Authorization header for subsequent requests
    if (response.data.token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Registration failed' };
  }
};

// Login user
export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    if (import.meta.env.DEV) console.debug('authService.login response:', response.data);
    if (response.data.user) {
      currentUser = response.data.user;
    }
    // If backend returned a token, set default Authorization header for subsequent requests
    if (response.data.token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Login failed' };
  }
};

// Logout user
export const logout = async () => {
  try {
    await api.post('/auth/logout');
    currentUser = null;
    // Remove Authorization header on logout
    delete api.defaults.headers.common['Authorization'];
  } catch (error) {
    console.error('Logout error:', error);
  }
};

// Get current user
export const getCurrentUser = async () => {
  try {
    if (!currentUser) {
      const response = await api.get('/auth/me');
      currentUser = response.data.user;
    }
    return currentUser;
  } catch (error) {
    currentUser = null;
    throw error.response?.data || { message: 'Failed to fetch user' };
  }
};

// Update profile
export const updateProfile = async (userData) => {
  try {
    const response = await api.put('/auth/updateprofile', userData);
    if (response.data.user) {
      currentUser = response.data.user;
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update profile' };
  }
};

// Update password
export const updatePassword = async (passwords) => {
  try {
    const response = await api.put('/auth/updatepassword', passwords);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update password' };
  }
};

// Check if user is logged in by verifying the session
export const isAuthenticated = async () => {
  try {
    await getCurrentUser();
    return true;
  } catch (error) {
    return false;
  }
};

// Get user from memory or fetch from server
export const getUser = async () => {
  return getCurrentUser();
};