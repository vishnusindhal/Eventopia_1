import api from './api';

// ── Subscription APIs ────────────────────────────────────────

export const getSubscriptions = async () => {
  const response = await api.get('/subscriptions');
  return response.data;
};

export const updateSubscriptions = async (subscriptionData) => {
  const response = await api.post('/subscriptions/update', subscriptionData);
  return response.data;
};

// ── Notification Preference APIs ─────────────────────────────

export const getPreferences = async () => {
  const response = await api.get('/preferences');
  return response.data;
};

export const updatePreferences = async (preferenceData) => {
  const response = await api.patch('/preferences', preferenceData);
  return response.data;
};
