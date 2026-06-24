import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getPreferences, updatePreferences } from '../services/subscriptionService';
import '../styles/Settings.css';

const NotificationSettings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [prefs, setPrefs] = useState({
    emailEnabled: true,
    inAppEnabled: true,
    dailyDigest: false,
    weeklyDigest: false,
    instantAlerts: true
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchPreferences();
  }, [user, navigate]);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const res = await getPreferences();
      setPrefs(res.preferences || prefs);
    } catch (err) {
      setError('Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      await updatePreferences(prefs);
      setSuccess('Preferences saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const preferenceItems = [
    {
      key: 'emailEnabled',
      icon: '📧',
      title: 'Email Notifications',
      description: 'Receive event alerts and updates via email'
    },
    {
      key: 'inAppEnabled',
      icon: '🔔',
      title: 'In-App Notifications',
      description: 'Show notifications in the website notification bell'
    },
    {
      key: 'instantAlerts',
      icon: '⚡',
      title: 'Instant Alerts',
      description: 'Get notified immediately when a matching event is published'
    },
    {
      key: 'dailyDigest',
      icon: '📋',
      title: 'Daily Digest',
      description: 'Receive a summary of new events every day at 8:00 PM'
    },
    {
      key: 'weeklyDigest',
      icon: '📅',
      title: 'Weekly Digest',
      description: 'Get a weekly summary of trending events every Sunday'
    }
  ];

  if (loading) {
    return (
      <div className="settings-page">
        <div className="settings-container">
          <div className="settings-loading">
            <div className="settings-spinner" />
            <p>Loading preferences...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="settings-container">
        {/* ── Page Header ──────────────────────────────────────── */}
        <div className="settings-header">
          <div>
            <h1>🔔 Notification Preferences</h1>
            <p>Control how and when you receive notifications.</p>
          </div>
          <button className="settings-save-btn" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : '💾 Save Changes'}
          </button>
        </div>

        {success && <div className="settings-toast settings-toast-success">{success}</div>}
        {error && <div className="settings-toast settings-toast-error">{error}</div>}

        {/* ── Preference Toggles ───────────────────────────────── */}
        <div className="settings-card">
          <div className="settings-card-header">
            <h2>Notification Channels</h2>
            <p>Choose your preferred notification delivery methods</p>
          </div>

          <div className="settings-pref-list">
            {preferenceItems.map(item => (
              <div key={item.key} className="settings-pref-item">
                <div className="pref-item-left">
                  <span className="pref-icon">{item.icon}</span>
                  <div className="pref-text">
                    <h4>{item.title}</h4>
                    <p>{item.description}</p>
                  </div>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={prefs[item.key]}
                    onChange={() => handleToggle(item.key)}
                  />
                  <span className="toggle-slider" />
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom Actions ───────────────────────────────────── */}
        <div className="settings-bottom-actions">
          <button className="settings-save-btn" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : '💾 Save Preferences'}
          </button>
          <button className="settings-link-btn" onClick={() => navigate('/settings/subscriptions')}>
            ← Following Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
