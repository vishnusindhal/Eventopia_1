import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import EventCard from '../components/EventCard';
import { getEventsByCollege } from '../services/eventService';
import '../styles/CollegePage.css';

const CollegePage = () => {
  const { institutionType, collegeName } = useParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const formatCollegeName = (slug) => {
    // We already know collegeName exists here because it's a route param,
    // but the slug could potentially be empty, so we keep the check simple.
    if (!slug) return '';
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
    setError('');
    try {
      console.log('Fetching events for:', displayName);
      // Ensure collegeName exists before calling the API
      if (!collegeName) {
        console.warn('collegeName is missing, skipping API call.');
        setEvents([]);
        return;
      }
      
      const response = await getEventsByCollege(collegeName);
      console.log('API Response:', response);
      
      if (response && response.events) {
        // Filter to show only approved events
        const approvedEvents = response.events.filter(event => event.status === 'approved');
        setEvents(approvedEvents);
        console.log('Approved Events:', approvedEvents);
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to load events. Please try again later.');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="college-page">
      <div className="college-page-header">
        {/*
          🔥 FIX APPLIED HERE (Line 55):
          We check if institutionType is truthy before calling .toUpperCase().
          If it's undefined (or null), we use a safe fallback string ('BACK').
        */}
        <Link 
          to={`/${institutionType || ''}`} 
          className="back-button"
        >
          ← Back to {institutionType ? `${institutionType.toUpperCase()}s` : 'List'}
        </Link>
        <h1>{displayName}</h1>
        <p>Upcoming events and activities</p>
      </div>

      <div className="college-page-content">
        {loading ? (
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Loading events...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h3>Oops! Something went wrong</h3>
            <p>{error}</p>
            <button onClick={fetchCollegeEvents} className="retry-button">
              Try Again
            </button>
          </div>
        ) : events.length > 0 ? (
          <>
            <div className="events-count">
              <h2>Upcoming Events ({events.length})</h2>
              <p className="events-subtitle">All approved events at {displayName}</p>
            </div>
            <div className="events-grid">
              {events.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          </>
        ) : (
          <div className="no-events-message">
            <div className="empty-icon">📅</div>
            <h3>No Events Yet</h3>
            <p>There are no approved events scheduled for {displayName} at the moment.</p>
            <div className="empty-actions">
              <Link to="/submit" className="btn-submit">
                📝 Submit an Event
              </Link>
              <Link to="/events" className="btn-browse">
                🔍 Browse All Events
              </Link>
            </div>
            <div className="empty-note">
              <p>💡 <strong>Note:</strong> Submitted events appear here after admin approval.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollegePage;