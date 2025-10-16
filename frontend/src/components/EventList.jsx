import React from 'react';
import EventCard from './EventCard';
import '../styles/EventList.css';

const EventList = ({ events }) => {
  if (!events || events.length === 0) {
    return (
      <div className="no-events">
        <p>No upcoming events found for this institution.</p>
      </div>
    );
  }

  return (
    <div className="event-list">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
};

export default EventList;