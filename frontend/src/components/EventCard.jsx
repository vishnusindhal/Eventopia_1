import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/EventCard.css';

const EventCard = ({ event }) => {
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getTypeColor = (type) => {
    const colors = {
      Technical: '#3b82f6',
      Cultural: '#8b5cf6',
      Hackathon: '#ef4444',
      Workshop: '#10b981',
      Seminar: '#f59e0b'
    };
    return colors[type] || '#6b7280';
  };

  return (
    <div className="event-card">
      <div className="event-header">
        <span 
          className="event-type" 
          style={{ backgroundColor: getTypeColor(event.type) }}
        >
          {event.type}
        </span>
        <span className="event-date">{formatDate(event.date)}</span>
      </div>
      
      <h3 className="event-title">{event.title}</h3>
      <p className="event-description">{event.description}</p>
      
      <div className="event-footer">
        <span className="event-college">{event.college}</span>
        {/* Use database _id if present, fallback to id for backwards compatibility */}
        <Link to={`/event/${event._id || event.id}`} className="view-details">
          View Details →
        </Link>
      </div>
    </div>
  );
};

export default EventCard;