import api from './api';

// Get all events (with optional filters)
export const getAllEvents = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.type) params.append('type', filters.type);
    if (filters.institutionType) params.append('institutionType', filters.institutionType);
    if (filters.college) params.append('college', filters.college);
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);

    const response = await api.get(`/events?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch events' };
  }
};

// Get single event by ID
export const getEventById = async (id) => {
  try {
    const response = await api.get(`/events/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch event' };
  }
};

// Get events by college
export const getEventsByCollege = async (collegeName) => {
  try {
    const response = await api.get(`/events/college/${collegeName}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch events' };
  }
};

// Get events by institution type
export const getEventsByInstitution = async (institutionType) => {
  try {
    const response = await api.get(`/events/institution/${institutionType}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch events' };
  }
};

// Create new event
export const createEvent = async (eventData) => {
  try {
    const response = await api.post('/events', eventData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create event' };
  }
};

// Update event
export const updateEvent = async (id, eventData) => {
  try {
    const response = await api.put(`/events/${id}`, eventData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update event' };
  }
};

// Delete event
export const deleteEvent = async (id) => {
  try {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete event' };
  }
};

// Register for event
export const registerForEvent = async (eventId) => {
  try {
    const response = await api.post(`/events/${eventId}/register`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to register for event' };
  }
};

// Unregister from event
export const unregisterFromEvent = async (eventId) => {
  try {
    const response = await api.post(`/events/${eventId}/unregister`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to unregister from event' };
  }
};

// Approve event (Admin only)
export const approveEvent = async (eventId) => {
  try {
    const response = await api.put(`/events/${eventId}/approve`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to approve event' };
  }
};

// Reject event (Admin only)
export const rejectEvent = async (eventId) => {
  try {
    const response = await api.put(`/events/${eventId}/reject`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to reject event' };
  }
};