import React, { useState, useEffect } from 'react';
import EventCard from '../components/EventCard';
import { getAllEvents } from '../services/eventService';
import '../styles/Events.css';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: 'all',
    search: ''
  });

  useEffect(() => {
    fetchAllEvents();
  }, [filters]);

  const fetchAllEvents = async () => {
    setLoading(true);
    try {
      const filterParams = {};
      if (filters.type !== 'all') filterParams.type = filters.type;
      if (filters.search) filterParams.search = filters.search;

      const response = await getAllEvents(filterParams);
      setEvents(response.events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  return (
    <div className="events-page">
      <div className="events-header">
        <h1>All Events</h1>
        <p>Discover upcoming events across all institutions</p>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search events..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>

        <div className="filter-buttons">
          <button
            className={filters.type === 'all' ? 'active' : ''}
            onClick={() => handleFilterChange('type', 'all')}
          >
            All
          </button>
          <button
            className={filters.type === 'Technical' ? 'active' : ''}
            onClick={() => handleFilterChange('type', 'Technical')}
          >
            Technical
          </button>
          <button
            className={filters.type === 'Cultural' ? 'active' : ''}
            onClick={() => handleFilterChange('type', 'Cultural')}
          >
            Cultural
          </button>
          <button
            className={filters.type === 'Hackathon' ? 'active' : ''}
            onClick={() => handleFilterChange('type', 'Hackathon')}
          >
            Hackathon
          </button>
          <button
            className={filters.type === 'Workshop' ? 'active' : ''}
            onClick={() => handleFilterChange('type', 'Workshop')}
          >
            Workshop
          </button>
        </div>
      </div>

      <div className="events-content">
        {loading ? (
          <div className="loading">Loading events...</div>
        ) : events.length > 0 ? (
          <div className="events-grid">
            {events.map(event => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        ) : (
          <div className="no-results">
            <p>No events found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;