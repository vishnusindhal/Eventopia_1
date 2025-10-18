import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import EventCard from '../components/EventCard';
import { getUserEvents, getRegisteredEvents, getUserStats } from '../services/userService';
import { deleteEvent } from '../services/eventService';
import { logout, getUser } from '../services/authService';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(getUser());
  const [myEvents, setMyEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [stats, setStats] = useState({});
  const [activeTab, setActiveTab] = useState('submitted');
  const [loading, setLoading] = useState(true);

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

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteEvent(eventId);
        setMyEvents(myEvents.filter(event => event._id !== eventId));
        alert('Event deleted successfully');
      } catch (error) {
        alert(error.message || 'Failed to delete event');
      }
    }
  };

  if (loading) {
    return <div className="loading-page">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="user-info">
          <h1>Welcome, {user?.name}!</h1>
          <p>{user?.email} • {user?.college}</p>
        </div>
        <div className="header-actions">
          <Link to="/submit" className="btn-primary">Submit Event</Link>
          <button onClick={handleLogout} className="btn-secondary">Logout</button>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-box">
          <h3>{stats.submittedEvents || 0}</h3>
          <p>Events Submitted</p>
        </div>
        <div className="stat-box">
          <h3>{stats.registeredEvents || 0}</h3>
          <p>Events Registered</p>
        </div>
        <div className="stat-box">
          <h3>{stats.approvedEvents || 0}</h3>
          <p>Approved Events</p>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="tabs">
          <button
            className={activeTab === 'submitted' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('submitted')}
          >
            My Submitted Events
          </button>
          <button
            className={activeTab === 'registered' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('registered')}
          >
            Registered Events
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'submitted' && (
            <div className="events-section">
              {myEvents.length > 0 ? (
                <div className="events-grid">
                  {myEvents.map(event => (
                    <div key={event._id} className="event-wrapper">
                      <EventCard event={event} />
                      <div className="event-actions">
                        <span className={`status-badge ${event.status}`}>
                          {event.status}
                        </span>
                        <button
                          onClick={() => handleDeleteEvent(event._id)}
                          className="btn-delete"
                        >
                          Delete
                        </button>
                      </div>
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

          {activeTab === 'registered' && (
            <div className="events-section">
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

export default Dashboard;