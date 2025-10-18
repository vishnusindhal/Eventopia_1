import api from './api';

// Get user's submitted events
export const getUserEvents = async () => {
  try {
    const response = await api.get('/users/events');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch user events' };
  }
};

// Get user's registered events
export const getRegisteredEvents = async () => {
  try {
    const response = await api.get('/users/registered-events');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch registered events' };
  }
};

// Get user statistics
export const getUserStats = async () => {
  try {
    const response = await api.get('/users/stats');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch user stats' };
  }
};