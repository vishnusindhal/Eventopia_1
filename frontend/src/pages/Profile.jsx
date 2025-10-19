import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import EventCard from '../components/EventCard';
import { getUserEvents, getRegisteredEvents, getUserStats } from '../services/userService';
import { deleteEvent } from '../services/eventService';
import { getUser, updateProfile, updatePassword } from '../services/authService';
import '../styles/Profile.css';

const Profile = () => {
  const [user, setUser] = useState(getUser());
  const [myEvents, setMyEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [stats, setStats] = useState({});
  const [activeSection, setActiveSection] = useState('info');
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [passwordMode, setPasswordMode] = useState(false);

  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    college: user?.college || '',
    institutionType: user?.institutionType || ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const [eventsRes, registeredRes, statsRes] = await Promise.all([
        getUserEvents(),
        getRegisteredEvents(),
        getUserStats()
      ]);

      setMyEvents(eventsRes.events || []);
      setRegisteredEvents(registeredRes.events || []);
      setStats(statsRes.stats || {});
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (e) => {
    setEditForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handlePasswordChange = (e) => {
    setPasswordForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(editForm);
      setUser(getUser());
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setEditMode(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match!' });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters!' });
      return;
    }

    try {
      await updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setPasswordMode(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to update password' });
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteEvent(eventId);
        setMyEvents(myEvents.filter(event => event._id !== eventId));
        setMessage({ type: 'success', text: 'Event deleted successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } catch (error) {
        setMessage({ type: 'error', text: error.message || 'Failed to delete event' });
      }
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return 'status-approved';
      case 'pending': return 'status-pending';
      case 'rejected': return 'status-rejected';
      default: return '';
    }
  };

  if (loading) {
    return <div className="loading-page">Loading profile...</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="profile-header-info">
            <h1>{user?.name}</h1>
            <p className="profile-email">{user?.email}</p>
            <p className="profile-college">{user?.college} • {user?.institutionType}</p>
          </div>
        </div>

        {/* Message Display */}
        {message.text && (
          <div className={`profile-message ${message.type}`}>
            {message.text}
          </div>
        )}

        {/* Stats Cards */}
        <div className="profile-stats">
          <div className="stat-card">
            <div className="stat-number">{stats.submittedEvents || 0}</div>
            <div className="stat-label">Total Submitted</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.approvedEvents || 0}</div>
            <div className="stat-label">Approved</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.pendingEvents || 0}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.registeredEvents || 0}</div>
            <div className="stat-label">Registered</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="profile-tabs">
          <button
            className={`profile-tab ${activeSection === 'info' ? 'active' : ''}`}
            onClick={() => setActiveSection('info')}
          >
            Personal Information
          </button>
          <button
            className={`profile-tab ${activeSection === 'submitted' ? 'active' : ''}`}
            onClick={() => setActiveSection('submitted')}
          >
            My Events ({myEvents.length})
          </button>
          <button
            className={`profile-tab ${activeSection === 'registered' ? 'active' : ''}`}
            onClick={() => setActiveSection('registered')}
          >
            Registered Events ({registeredEvents.length})
          </button>
        </div>

        {/* Content Sections */}
        <div className="profile-content">
          {/* Personal Information Section */}
          {activeSection === 'info' && (
            <div className="profile-section">
              <div className="section-header">
                <h2>Personal Information</h2>
                {!editMode && !passwordMode && (
                  <button className="btn-edit" onClick={() => setEditMode(true)}>
                    Edit Profile
                  </button>
                )}
              </div>

              {editMode ? (
                <form className="profile-form" onSubmit={handleUpdateProfile}>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={editForm.name}
                      onChange={handleEditChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>College/Institution</label>
                    <input
                      type="text"
                      name="college"
                      value={editForm.college}
                      onChange={handleEditChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Institution Type</label>
                    <select
                      name="institutionType"
                      value={editForm.institutionType}
                      onChange={handleEditChange}
                      required
                    >
                      <option value="IIIT">IIIT</option>
                      <option value="NIT">NIT</option>
                      <option value="IIT">IIT</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn-save">Save Changes</button>
                    <button type="button" className="btn-cancel" onClick={() => setEditMode(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="profile-info-grid">
                  <div className="info-item">
                    <span className="info-label">Full Name</span>
                    <span className="info-value">{user?.name}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Email Address</span>
                    <span className="info-value">{user?.email}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">College/Institution</span>
                    <span className="info-value">{user?.college}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Institution Type</span>
                    <span className="info-value">{user?.institutionType}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Account Role</span>
                    <span className="info-value">{user?.role}</span>
                  </div>
                </div>
              )}

              {!editMode && (
                <div className="password-section">
                  <h3>Security</h3>
                  {passwordMode ? (
                    <form className="profile-form" onSubmit={handleUpdatePassword}>
                      <div className="form-group">
                        <label>Current Password</label>
                        <input
                          type="password"
                          name="currentPassword"
                          value={passwordForm.currentPassword}
                          onChange={handlePasswordChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>New Password</label>
                        <input
                          type="password"
                          name="newPassword"
                          value={passwordForm.newPassword}
                          onChange={handlePasswordChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Confirm New Password</label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={passwordForm.confirmPassword}
                          onChange={handlePasswordChange}
                          required
                        />
                      </div>
                      <div className="form-actions">
                        <button type="submit" className="btn-save">Update Password</button>
                        <button type="button" className="btn-cancel" onClick={() => setPasswordMode(false)}>
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button className="btn-change-password" onClick={() => setPasswordMode(true)}>
                      Change Password
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* My Submitted Events Section */}
          {activeSection === 'submitted' && (
            <div className="profile-section">
              <div className="section-header">
                <h2>My Submitted Events</h2>
                <Link to="/submit" className="btn-add">+ Submit New Event</Link>
              </div>

              {myEvents.length > 0 ? (
                <div className="events-grid">
                  {myEvents.map(event => (
                    <div key={event._id} className="event-wrapper">
                      <EventCard event={event} />
                      <div className="event-meta">
                        <span className={`event-status ${getStatusColor(event.status)}`}>
                          {event.status.toUpperCase()}
                        </span>
                        <button
                          className="btn-delete-small"
                          onClick={() => handleDeleteEvent(event._id)}
                        >
                          Delete
                        </button>
                      </div>
                      {event.status === 'pending' && (
                        <div className="event-note">
                          ⏳ Waiting for admin approval
                        </div>
                      )}
                      {event.status === 'rejected' && (
                        <div className="event-note rejected-note">
                          ❌ Event was not approved
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>You haven't submitted any events yet.</p>
                  <Link to="/submit" className="btn-primary">Submit Your First Event</Link>
                </div>
              )}
            </div>
          )}

          {/* Registered Events Section */}
          {activeSection === 'registered' && (
            <div className="profile-section">
              <h2>Events I'm Registered For</h2>

              {registeredEvents.length > 0 ? (
                <div className="events-grid">
                  {registeredEvents.map(event => (
                    <EventCard key={event._id} event={event} />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>You haven't registered for any events yet.</p>
                  <Link to="/events" className="btn-primary">Browse Events</Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;