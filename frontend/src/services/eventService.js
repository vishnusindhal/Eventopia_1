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

// ── Participant Management & Export ─────────────────────────────────

// Get paginated participants for an event (Owner or Admin)
export const getEventParticipants = async (eventId, params = {}) => {
  try {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.search) query.append('search', params.search);
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.sortOrder) query.append('sortOrder', params.sortOrder);

    const response = await api.get(`/events/${eventId}/participants?${query.toString()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch participants' };
  }
};

// Download participant report as PDF (triggers browser download)
export const downloadParticipantPDF = async (eventId) => {
  try {
    const response = await api.get(`/events/${eventId}/export/pdf`, {
      responseType: 'blob',
    });

    // Extract filename from Content-Disposition header or use a default
    const disposition = response.headers['content-disposition'];
    let filename = 'Participants.pdf';
    if (disposition) {
      const match = disposition.match(/filename="?(.+?)"?$/);
      if (match) filename = match[1];
    }

    // Create a temporary download link
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    throw error.response?.data || { message: 'Failed to download PDF' };
  }
};

// Download participant data as CSV (triggers browser download)
export const downloadParticipantCSV = async (eventId) => {
  try {
    const response = await api.get(`/events/${eventId}/export/csv`, {
      responseType: 'blob',
    });

    const disposition = response.headers['content-disposition'];
    let filename = 'Participants.csv';
    if (disposition) {
      const match = disposition.match(/filename="?(.+?)"?$/);
      if (match) filename = match[1];
    }

    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    throw error.response?.data || { message: 'Failed to download CSV' };
  }
};