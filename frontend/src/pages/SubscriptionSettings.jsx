import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getSubscriptions, updateSubscriptions } from '../services/subscriptionService';
import { ALL_COLLEGES, INSTITUTION_TYPES, EVENT_CATEGORIES } from '../config/colleges';
import '../styles/Settings.css';

const SubscriptionSettings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [institutes, setInstitutes] = useState([]);
  const [institutionTypes, setInstitutionTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subscribeAll, setSubscribeAll] = useState(false);

  // College search
  const [collegeSearch, setCollegeSearch] = useState('');
  const [showCollegeDropdown, setShowCollegeDropdown] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchSubscriptions();
  }, [user, navigate]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const res = await getSubscriptions();
      const subs = res.subscriptions || {};
      setInstitutes(subs.institutes || []);
      setInstitutionTypes(subs.institutionTypes || []);
      setCategories(subs.categories || []);
      setSubscribeAll(subs.subscribeAllInstitutes || false);
    } catch (err) {
      setError('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      await updateSubscriptions({
        institutes,
        institutionTypes,
        categories,
        subscribeAllInstitutes: subscribeAll
      });
      setSuccess('Subscriptions saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save subscriptions');
    } finally {
      setSaving(false);
    }
  };

  const toggleInstitute = (college) => {
    setInstitutes(prev =>
      prev.includes(college) ? prev.filter(c => c !== college) : [...prev, college]
    );
  };

  const removeInstitute = (college) => {
    setInstitutes(prev => prev.filter(c => c !== college));
  };

  const toggleInstitutionType = (type) => {
    setInstitutionTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const toggleCategory = (cat) => {
    setCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const filteredColleges = ALL_COLLEGES.filter(c =>
    c.toLowerCase().includes(collegeSearch.toLowerCase()) && !institutes.includes(c)
  );

  if (loading) {
    return (
      <div className="settings-page">
        <div className="settings-container">
          <div className="settings-loading">
            <div className="settings-spinner" />
            <p>Loading subscriptions...</p>
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
            <h1>📡 Following Settings</h1>
            <p className="settings-subtitle">Choose which institutes and event categories you want to follow.</p>
          </div>
          <button className="settings-save-btn" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : '💾 Save Changes'}
          </button>
        </div>

        {success && <div className="settings-toast settings-toast-success">{success}</div>}
        {error && <div className="settings-toast settings-toast-error">{error}</div>}

        {/* ── Subscribe All Toggle ─────────────────────────────── */}
        <div className="settings-card">
          <div className="settings-card-header">
            <h2>🌍 Follow All Institutes</h2>
            <p>Receive notifications from every institute on Eventopia</p>
          </div>
          <div className="settings-toggle-row">
            <span className="toggle-label">
              {subscribeAll ? "You're following ALL institutes" : 'Follow all institutes'}
            </span>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={subscribeAll}
                onChange={(e) => setSubscribeAll(e.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
          </div>
        </div>

        {/* ── Institution Type Subscriptions ───────────────────── */}
        {!subscribeAll && (
          <div className="settings-card">
            <div className="settings-card-header">
              <h2>🏛️ Institution Types</h2>
              <p>Follow entire institution categories</p>
            </div>
            <div className="settings-chip-grid">
              {INSTITUTION_TYPES.map(({ value, label }) => (
                <button
                  key={value}
                  className={`settings-chip ${institutionTypes.includes(value) ? 'active' : ''}`}
                  onClick={() => toggleInstitutionType(value)}
                >
                  {institutionTypes.includes(value) && <span className="chip-check">✓</span>}
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Individual College Subscriptions ─────────────────── */}
        {!subscribeAll && (
          <div className="settings-card">
            <div className="settings-card-header">
              <h2>🏫 Individual Institutes</h2>
              <p>Follow specific colleges</p>
            </div>

            {/* Selected colleges */}
            {institutes.length > 0 && (
              <div className="settings-selected-tags">
                {institutes.map(college => (
                  <span key={college} className="settings-tag">
                    {college}
                    <button className="tag-remove" onClick={() => removeInstitute(college)}>✕</button>
                  </span>
                ))}
              </div>
            )}

            {/* Search & add */}
            <div className="settings-search-wrapper">
              <input
                type="text"
                className="settings-search-input"
                placeholder="🔍 Search colleges..."
                value={collegeSearch}
                onChange={(e) => {
                  setCollegeSearch(e.target.value);
                  setShowCollegeDropdown(true);
                }}
                onFocus={() => setShowCollegeDropdown(true)}
                id="college-search"
              />
              {showCollegeDropdown && collegeSearch && (
                <div className="settings-search-dropdown">
                  {filteredColleges.length === 0 ? (
                    <div className="search-dropdown-empty">No colleges found</div>
                  ) : (
                    filteredColleges.slice(0, 10).map(college => (
                      <button
                        key={college}
                        className="search-dropdown-item"
                        onClick={() => {
                          toggleInstitute(college);
                          setCollegeSearch('');
                          setShowCollegeDropdown(false);
                        }}
                      >
                        {college}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Category Subscriptions ───────────────────────────── */}
        <div className="settings-card">
          <div className="settings-card-header">
            <h2>🏷️ Event Categories</h2>
            <p>Only receive notifications for selected event types. Leave empty to get all.</p>
          </div>
          <div className="settings-chip-grid">
            {EVENT_CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`settings-chip ${categories.includes(cat) ? 'active' : ''}`}
                onClick={() => toggleCategory(cat)}
              >
                {categories.includes(cat) && <span className="chip-check">✓</span>}
                {cat}
              </button>
            ))}
          </div>
          {categories.length === 0 && (
            <p className="settings-hint">💡 No categories selected = you'll receive notifications for all categories.</p>
          )}
        </div>

        {/* ── Bottom Save ──────────────────────────────────────── */}
        <div className="settings-bottom-actions">
          <button className="settings-save-btn" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : '💾 Save Following'}
          </button>
          <button className="settings-link-btn" onClick={() => navigate('/settings/notifications')}>
            Notification Preferences →
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionSettings;
