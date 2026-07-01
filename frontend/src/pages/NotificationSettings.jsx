import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getPreferences, updatePreferences } from '../services/subscriptionService';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

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
      <div className="flex h-[60vh] w-full items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
          <p className="text-slate-500 font-medium">Loading preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <span className="text-4xl">🔔</span> Notification Preferences
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Control how and when you receive notifications.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="whitespace-nowrap">
          {saving ? 'Saving...' : '💾 Save Changes'}
        </Button>
      </div>

      {success && (
        <div className="mb-6 p-4 rounded-md bg-success/10 border border-success/20 flex items-center text-success font-medium animate-in slide-in-from-top-2">
          <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {success}
        </div>
      )}
      
      {error && (
        <div className="mb-6 p-4 rounded-md bg-danger/10 border border-danger/20 flex items-center text-danger font-medium animate-in slide-in-from-top-2">
          <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {error}
        </div>
      )}

      <Card className="overflow-hidden mb-8 border-t-4 border-t-primary">
        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Notification Channels</h2>
          <p className="text-slate-500 text-sm mt-1">Choose your preferred notification delivery methods</p>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
          {preferenceItems.map(item => (
            <div key={item.key} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
              <div className="flex items-start gap-4">
                <span className="text-3xl bg-slate-100 dark:bg-slate-800 p-3 rounded-xl">{item.icon}</span>
                <div>
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">{item.title}</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">{item.description}</p>
                </div>
              </div>
              <div className="sm:pl-4 self-end sm:self-auto">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={prefs[item.key]}
                    onChange={() => handleToggle(item.key)}
                  />
                  <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/30 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-800">
        <Button variant="outline" onClick={() => navigate('/settings/subscriptions')} className="w-full sm:w-auto">
          ← Following Settings
        </Button>
        <Button onClick={handleSave} disabled={saving} size="lg" className="w-full sm:w-auto shadow-md">
          {saving ? 'Saving...' : '💾 Save Preferences'}
        </Button>
      </div>
    </div>
  );
};

export default NotificationSettings;
