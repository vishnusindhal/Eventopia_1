import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getEventById, registerForEvent } from '../services/eventService';
import { isAuthenticated } from '../services/authService';
import '../styles/EventDetails.css';

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    setLoading(true);
    try {
      const response = await getEventById(id);
      setEvent(response.event);
    } catch (error) {
      console.error('Error fetching event details:', error);
      setEvent(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!isAuthenticated()) {
      alert('Please login to register for this event');
      return;
    }

    setRegistering(true);
    try {
      await registerForEvent(id);
      alert('Successfully registered for the event!');
      fetchEventDetails(); // Refresh event details
    } catch (error) {
      alert(error.message || 'Failed to register for event');
    } finally {
      setRegistering(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return <div className="loading-page">Loading event details...</div>;
  }

  if (!event) {
    return (
      <div className="error-page">
        <h2>Event not found</h2>
        <Link to="/events">Back to Events</Link>
      </div>
    );
  }

  return (
    <div className="event-details-page">
      <div className="event-details-header">
        <img src={event.image || 'https://via.placeholder.com/800x400'} alt={event.title} className="event-banner" />
        <div className="event-details-overlay">
          <span className="event-type-badge">{event.type}</span>
          <h1>{event.title}</h1>
          <p className="event-college">{event.college}</p>
        </div>
      </div>

      <div className="event-details-content">
        <div className="event-main-info">
          <section className="info-section">
            <h2>About the Event</h2>
            <p>{event.description}</p>
          </section>

          {event.highlights && event.highlights.length > 0 && (
            <section className="info-section">
              <h2>Highlights</h2>
              <ul className="highlights-list">
                {event.highlights.map((highlight, index) => (
                  <li key={index}>{highlight}</li>
                ))}
              </ul>
            </section>
          )}

          {event.schedule && event.schedule.length > 0 && (
            <section className="info-section">
              <h2>Schedule</h2>
              <div className="schedule-list">
                {event.schedule.map((item, index) => (
                  <div key={index} className="schedule-item">
                    <span className="schedule-time">{item.time}</span>
                    <span className="schedule-activity">{item.activity}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="event-sidebar">
          <div className="info-card">
            <h3>Event Details</h3>
            <div className="detail-item">
              <span className="detail-label">Date:</span>
              <span className="detail-value">{formatDate(event.date)}</span>
            </div>
            {event.endDate && (
              <div className="detail-item">
                <span className="detail-label">End Date:</span>
                <span className="detail-value">{formatDate(event.endDate)}</span>
              </div>
            )}
            <div className="detail-item">
              <span className="detail-label">Venue:</span>
              <span className="detail-value">{event.venue}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Organizer:</span>
              <span className="detail-value">{event.organizer}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Contact:</span>
              <span className="detail-value">{event.contact}</span>
            </div>
          </div>

          <button 
            className="register-button" 
            onClick={handleRegister}
            disabled={registering}
          >
            {registering ? 'Registering...' : 'Register Now'}
          </button>

          <Link to="/events" className="back-link">
            ← Back to All Events
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;