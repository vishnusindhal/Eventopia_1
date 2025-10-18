import React, { useEffect, useState } from 'react';
import EventList from './EventList';
import { getEventsByCollege } from '../services/eventService';
import '../styles/CollegeList.css';

const CollegeList = ({ colleges, selectedCollege, onCollegeSelect, institutionType }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedCollege) {
      fetchEvents(selectedCollege);
    }
  }, [selectedCollege]);

  const fetchEvents = async (collegeName) => {
    setLoading(true);
    try {
      const slug = collegeName.toLowerCase().replace(/\s+/g, '-');
      const response = await getEventsByCollege(slug);
      setEvents(response.events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="college-list">
      <div className="colleges-grid">
        {colleges.map((college) => (
          <div
            key={college}
            className={`college-item ${selectedCollege === college ? 'active' : ''}`}
            onClick={() => onCollegeSelect(college)}
          >
            <span className="college-name">{college}</span>
            <span className="arrow">{selectedCollege === college ? '▼' : '▶'}</span>
          </div>
        ))}
      </div>

      {selectedCollege && (
        <div className="events-container">
          <h4>Upcoming Events at {selectedCollege}</h4>
          {loading ? (
            <div className="loading">Loading events...</div>
          ) : (
            <EventList events={events} />
          )}
        </div>
      )}
    </div>
  );
};

export default CollegeList;