import React, { useState, useEffect } from 'react';
import EventCard from '../components/EventCard';
import '../styles/Events.css';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: 'all',
    institution: 'all',
    search: ''
  });

  useEffect(() => {
    fetchAllEvents();
  }, [filters]);

  const fetchAllEvents = async () => {
    setLoading(true);
    try {
      // Replace with your actual API endpoint
      // const response = await fetch('/api/events');
      // const data = await response.json();
      
      // Sample data
      const sampleEvents = [
        {
          id: 1,
          title: 'TechFest 2024',
          date: '2024-11-15',
          type: 'Technical',
          description: 'Annual technical festival with coding competitions',
          college: 'IIIT Surat'
        },
        {
          id: 2,
          title: 'CodeSprint Hackathon',
          date: '2024-11-20',
          type: 'Hackathon',
          description: '24-hour coding marathon',
          college: 'NIT Trichy'
        },
        {
          id: 3,
          title: 'Cultural Night',
          date: '2024-12-01',
          type: 'Cultural',
          description: 'Cultural performances and art exhibitions',
          college: 'IIT Bombay'
        },
        {
          id: 4,
          title: 'AI Workshop',
          date: '2024-11-25',
          type: 'Workshop',
          description: 'Hands-on workshop on Machine Learning',
          college: 'IIIT Delhi'
        },
        {
          id: 5,
          title: 'Startup Summit',
          date: '2024-12-05',
          type: 'Seminar',
          description: 'Meet entrepreneurs and investors',
          college: 'IIT Delhi'
        },
        {
          id: 6,
          title: 'Robotics Competition',
          date: '2024-11-18',
          type: 'Technical',
          description: 'Build and compete with your robots',
          college: 'NIT Warangal'
        }
      ];
      
      setEvents(sampleEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
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

  const filteredEvents = events.filter(event => {
    const matchesType = filters.type === 'all' || event.type === filters.type;
    const matchesSearch = event.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                         event.description.toLowerCase().includes(filters.search.toLowerCase());
    return matchesType && matchesSearch;
  });

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
        ) : filteredEvents.length > 0 ? (
          <div className="events-grid">
            {filteredEvents.map(event => (
              <EventCard key={event.id} event={event} />
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