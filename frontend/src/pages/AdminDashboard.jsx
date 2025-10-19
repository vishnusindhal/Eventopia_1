import React, { useState, useEffect } from 'react';
import { approveEvent, rejectEvent } from '../services/eventService';
import { getUser } from '../services/authService';
import api from '../services/api';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const user = getUser();
  const [pendingEvents, setPendingEvents] = useState([]);
  const [approvedEvents, setApprovedEvents] = useState([]);
  const [rejectedEvents, setRejectedEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user?.role !== 'admin') {
      window.location.href = '/';
      return;
    }
    fetchAllEvents();
  }, []);

  const fetchAllEvents = async () => {
    setLoading(true);
    try {
      // Fetch events with different statuses
      const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
        api.get('/events?status=pending'),
        api.get('/events?status=approved'),
        api.get('/events?status=rejected')
      ]);

      setPendingEvents(pendingRes.data.events || []);
      setApprovedEvents(approvedRes.data.events || []);
      setRejectedEvents(rejectedRes.data.events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (eventId) => {
    try {
      await approveEvent(eventId);
      setMessage({ type: 'success', text: 'Event approved successfully!' });
      fetchAllEvents();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to approve event' });
    }
  };

  const handleReject = async (eventId) => {
    if (window.confirm('Are you sure you want to reject this event?')) {
      try {
        await rejectEvent(eventId);
        setMessage({ type: 'success', text: 'Event rejected' });
        fetchAllEvents();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } catch (error) {
        setMessage({ type: 'error', text: error.message || 'Failed to reject event' });
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const EventCard = ({ event, showActions = false }) => (
    <div className="admin-event-card">
      <div className="admin-event-header">
        <span className={`admin-event-type ${event.type.toLowerCase()}`}>
          {event.type}
        </span>
        <span className="admin-event-date">{formatDate(event.date)}</span>
      </div>
      
      <h3 className="admin-event-title">{event.title}</h3>
      <p className="admin-event-description">{event.description}</p>
      
      <div className="admin-event-details">
        <div className="detail-row">
          <span className="detail-label">College:</span>
          <span className="detail-value">{event.college}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Institution:</span>
          <span className="detail-value">{event.institutionType}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Venue:</span>
          <span className="detail-value">{event.venue}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Organizer:</span>
          <span className="detail-value">{event.organizer}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Contact:</span>
          <span className="detail-value">{event.contact}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Submitted by:</span>
          <span className="detail-value">{event.createdBy?.name || 'Unknown'}</span>
        </div>
      </div>

      {showActions && (
        <div className="admin-event-actions">
          <button 
            className="btn-approve"
            onClick={() => handleApprove(event._id)}
          >
            ✓ Approve
          </button>
          <button 
            className="btn-reject"
            onClick={() => handleReject(event._id)}
          >
            ✗ Reject
          </button>
        </div>
      )}
    </div>
  );

  if (loading) {
    return <div className="loading-page">Loading admin dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-container">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <p>Manage and approve events</p>
        </div>

        {message.text && (
          <div className={`admin-message ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="admin-stats">
          <div className="admin-stat-card">
            <div className="stat-number">{pendingEvents.length}</div>
            <div className="stat-label">Pending Approval</div>
          </div>
          <div className="admin-stat-card">
            <div className="stat-number">{approvedEvents.length}</div>
            <div className="stat-label">Approved Events</div>
          </div>
          <div className="admin-stat-card">
            <div className="stat-number">{rejectedEvents.length}</div>
            <div className="stat-label">Rejected Events</div>
          </div>
          <div className="admin-stat-card">
            <div className="stat-number">
              {pendingEvents.length + approvedEvents.length + rejectedEvents.length}
            </div>
            <div className="stat-label">Total Events</div>
          </div>
        </div>

        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending ({pendingEvents.length})
          </button>
          <button
            className={`admin-tab ${activeTab === 'approved' ? 'active' : ''}`}
            onClick={() => setActiveTab('approved')}
          >
            Approved ({approvedEvents.length})
          </button>
          <button
            className={`admin-tab ${activeTab === 'rejected' ? 'active' : ''}`}
            onClick={() => setActiveTab('rejected')}
          >
            Rejected ({rejectedEvents.length})
          </button>
        </div>

        <div className="admin-content">
          {activeTab === 'pending' && (
            <div className="admin-section">
              <h2>Events Pending Approval</h2>
              {pendingEvents.length > 0 ? (
                <div className="admin-events-grid">
                  {pendingEvents.map(event => (
                    <EventCard key={event._id} event={event} showActions={true} />
                  ))}
                </div>
              ) : (
                <div className="admin-empty-state">
                  <p>No pending events to review</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'approved' && (
            <div className="admin-section">
              <h2>Approved Events</h2>
              {approvedEvents.length > 0 ? (
                <div className="admin-events-grid">
                  {approvedEvents.map(event => (
                    <EventCard key={event._id} event={event} />
                  ))}
                </div>
              ) : (
                <div className="admin-empty-state">
                  <p>No approved events yet</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'rejected' && (
            <div className="admin-section">
              <h2>Rejected Events</h2>
              {rejectedEvents.length > 0 ? (
                <div className="admin-events-grid">
                  {rejectedEvents.map(event => (
                    <EventCard key={event._id} event={event} />
                  ))}
                </div>
              ) : (
                <div className="admin-empty-state">
                  <p>No rejected events</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;