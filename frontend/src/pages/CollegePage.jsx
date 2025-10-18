import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import EventCard from '../components/EventCard';
import { getEventsByCollege } from '../services/eventService';
import '../styles/CollegePage.css';

const CollegePage = () => {
  const { institutionType, collegeName } = useParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatCollegeName = (slug) => {
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const displayName = formatCollegeName(collegeName);

  useEffect(() => {
    fetchCollegeEvents();
  }, [collegeName]);

  const fetchCollegeEvents = async () => {
    setLoading(true);
    try {
      const response = await getEventsByCollege(collegeName);
      setEvents(response.events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="college-page">
      <div className="college-page-header">
        <Link to={`/${institutionType}`} className="back-button">
          ← Back to {institutionType.toUpperCase()}s
        </Link>
        <h1>{displayName}</h1>
        <p>Upcoming events and activities</p>
      </div>

      <div className="college-page-content">
        {loading ? (
          <div className="loading">Loading events...</div>
        ) : events.length > 0 ? (
          <>
            <div className="events-count">
              <h2>Upcoming Events ({events.length})</h2>
            </div>
            <div className="events-grid">
              {events.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          </>
        ) : (
          <div className="no-events-message">
            <h3>No upcoming events</h3>
            <p>There are no events scheduled for {displayName} at the moment.</p>
            <Link to="/submit" className="btn-submit">Submit an Event</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollegePage;