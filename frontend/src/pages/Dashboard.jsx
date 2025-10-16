import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import EventCard from '../components/EventCard';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    college: 'IIIT Surat'
  });
  const [myEvents, setMyEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('submitted');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      // Replace with your actual API endpoints
      // const response = await fetch('/api/user/events', {
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   }
      // });
      
      // Sample data
      const sampleMyEvents = [
        {
          id: 1,
          title: 'TechFest 2024',
          date: '2024-11-15',
          type: 'Technical',
          description: 'Annual technical festival',
          college: 'IIIT Surat',
          status: 'approved'
        },
        {
          id: 2,
          title: 'Code Sprint',
          date: '2024-11-20',
          type: 'Hackathon',
          description: '24-hour coding marathon',
          college: 'IIIT Surat',
          status: 'pending'
        }
      ];

      const sampleRegisteredEvents = [
        {
          id: 3,
          title: 'AI Workshop',
          date: '2024-11-25',
          type: 'Workshop',
          description: 'Hands-on AI workshop',
          college: 'IIT Delhi'
        }
      ];

      setMyEvents(sampleMyEvents);
      setRegisteredEvents(sampleRegisteredEvents);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleLogout = () => {
    // localStorage.removeItem('token');
    navigate('/');
  };

  const handleDeleteEvent = (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      setMyEvents(myEvents.filter(event => event.id !== eventId));
      // Add API call: await fetch(`/api/events/${eventId}`, { method: 'DELETE' })
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="user-info">
          <h1>Welcome, {user.name}!</h1>
          <p>{user.email} • {user.college}</p>
        </div>
        <div className="header-actions">
          <Link to="/submit" className="btn-primary">Submit Event</Link>
          <button onClick={handleLogout} className="btn-secondary">Logout</button>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-box">
          <h3>{myEvents.length}</h3>
          <p>Events Submitted</p>
        </div>
        <div className="stat-box">
          <h3>{registeredEvents.length}</h3>
          <p>Events Registered</p>
        </div>
        <div className="stat-box">
          <h3>{myEvents.filter(e => e.status === 'approved').length}</h3>
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
                    <div key={event.id} className="event-wrapper">
                      <EventCard event={event} />
                      <div className="event-actions">
                        <span className={`status-badge ${event.status}`}>
                          {event.status}
                        </span>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
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
                    <EventCard key={event.id} event={event} />
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