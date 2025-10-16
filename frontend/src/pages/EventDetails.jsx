import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../styles/EventDetails.css';

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    setLoading(true);
    try {
      // Replace with your actual API endpoint
      // const response = await fetch(`/api/events/${id}`);
      // const data = await response.json();
      
      // Sample data
      const sampleEvent = {
        id: id,
        title: 'TechFest 2024',
        date: '2024-11-15',
        endDate: '2024-11-17',
        type: 'Technical',
        description: 'TechFest 2024 is the annual technical festival featuring coding competitions, workshops, and tech talks from industry experts.',
        college: 'IIIT Surat',
        venue: 'Main Auditorium',
        organizer: 'Technical Club',
        contact: 'techfest@iiitsurat.ac.in',
        registrationLink: 'https://example.com/register',
        image: 'https://via.placeholder.com/800x400',
        highlights: [
          'Coding competitions with prizes worth ₹50,000',
          'Workshops on AI/ML, Web Development, and Blockchain',
          'Tech talks from industry leaders',
          'Networking opportunities with tech professionals'
        ],
        schedule: [
          { time: '10:00 AM', activity: 'Opening Ceremony' },
          { time: '11:00 AM', activity: 'Coding Competition Round 1' },
          { time: '02:00 PM', activity: 'Workshop: Introduction to AI' },
          { time: '04:00 PM', activity: 'Tech Talk: Future of Technology' }
        ]
      };
      
      setEvent(sampleEvent);
    } catch (error) {
      console.error('Error fetching event details:', error);
    } finally {
      setLoading(false);
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
        <img src={event.image} alt={event.title} className="event-banner" />
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

          <section className="info-section">
            <h2>Highlights</h2>
            <ul className="highlights-list">
              {event.highlights.map((highlight, index) => (
                <li key={index}>{highlight}</li>
              ))}
            </ul>
          </section>

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

          <button className="register-button">
            Register Now
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