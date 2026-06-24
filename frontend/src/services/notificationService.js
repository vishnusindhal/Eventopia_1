import api from './api';

// ── Notification APIs ────────────────────────────────────────

export const getNotifications = async ({ page = 1, limit = 20, read, search } = {}) => {
  const params = new URLSearchParams();
  params.append('page', page);
  params.append('limit', limit);
  if (read !== undefined) params.append('read', read);
  if (search) params.append('search', search);

  const response = await api.get(`/notifications?${params.toString()}`);
  return response.data;
};

export const getUnreadCount = async () => {
  const response = await api.get('/notifications/unread-count');
  return response.data;
};

export const markAsRead = async (id) => {
  const response = await api.patch(`/notifications/${id}/read`);
  return response.data;
};

export const markAllAsRead = async () => {
  const response = await api.patch('/notifications/read-all');
  return response.data;
};

export const deleteNotification = async (id) => {
  const response = await api.delete(`/notifications/${id}`);
  return response.data;
};

export const deleteAllNotifications = async () => {
  const response = await api.delete('/notifications/all');
  return response.data;
};
