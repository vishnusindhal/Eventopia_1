import React, { useEffect, useState } from 'react';
import EventList from './EventList';
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
      // Replace with your actual API endpoint
      // const response = await fetch(`/api/events?college=${collegeName}`);
      // const data = await response.json();
      
      // Sample data for demonstration
      const sampleEvents = [
        {
          id: 1,
          title: 'TechFest 2024',
          date: '2024-11-15',
          type: 'Technical',
          description: 'Annual technical festival with coding competitions and workshops',
          college: collegeName
        },
        {
          id: 2,
          title: 'CodeSprint Hackathon',
          date: '2024-11-20',
          type: 'Hackathon',
          description: '24-hour coding marathon with exciting prizes',
          college: collegeName
        },
        {
          id: 3,
          title: 'Cultural Night',
          date: '2024-12-01',
          type: 'Cultural',
          description: 'Experience diverse cultural performances and art exhibitions',
          college: collegeName
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