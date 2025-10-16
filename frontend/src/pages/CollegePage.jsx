import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import EventCard from '../components/EventCard';
import '../styles/CollegePage.css';

const CollegePage = () => {
  const { institutionType, collegeName } = useParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Convert slug back to readable name
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
      // Replace with your actual API endpoint
      // const response = await fetch(`/api/events/college/${collegeName}`);
      // const data = await response.json();
      
      // Sample data
      const sampleEvents = [
        {
          id: 1,
          title: 'TechFest 2024',
          date: '2024-11-15',
          type: 'Technical',
          description: 'Annual technical festival with coding competitions and workshops',
          college: displayName
        },
        {
          id: 2,
          title: 'CodeSprint Hackathon',
          date: '2024-11-20',
          type: 'Hackathon',
          description: '24-hour coding marathon with exciting prizes',
          college: displayName
        },
        {
          id: 3,
          title: 'Cultural Night',
          date: '2024-12-01',
          type: 'Cultural',
          description: 'Experience diverse cultural performances and art exhibitions',
          college: displayName
        },
        {
          id: 4,
          title: 'AI/ML Workshop',
          date: '2024-11-25',
          type: 'Workshop',
          description: 'Hands-on workshop on Artificial Intelligence and Machine Learning',
          college: displayName
        },
        {
          id: 5,
          title: 'Startup Conclave',
          date: '2024-12-10',
          type: 'Seminar',
          description: 'Meet entrepreneurs and learn about startup ecosystem',
          college: displayName
        }
      ];
      
      setEvents(sampleEvents);
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
                <EventCard key={event.id} event={event} />
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