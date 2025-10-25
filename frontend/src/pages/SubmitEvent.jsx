import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEvent } from '../services/eventService';
import { useAuth } from '../contexts/AuthContext';
import '../styles/SubmitEvent.css';

const SubmitEvent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Technical',
    college: '',
    institutionType: 'IIIT',
    date: '',
    endDate: '',
    venue: '',
    organizer: '',
    contact: '',
    registrationLink: '',
    image: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    setError('');

    try {
      const authenticated = await isAuthenticated();
      if (!authenticated) {
        alert('Please login to submit an event');
        navigate('/login');
        return;
      }

    try {
      await createEvent(formData);
      setSubmitted(true);
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (err) {
      setError(err.message || 'Failed to submit event. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="submit-event-page">
      <div className="submit-header">
        <h1>Submit an Event</h1>
        <p>Share your event with students across IIITs, NITs, and IITs</p>
      </div>

      {submitted && (
        <div className="success-message">
          <p>✓ Event submitted successfully! It will be reviewed and published soon.</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      <form className="submit-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="title">Event Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="e.g., TechFest 2024"
            />
          </div>

          <div className="form-group">
            <label htmlFor="type">Event Type *</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="Technical">Technical</option>
              <option value="Cultural">Cultural</option>
              <option value="Hackathon">Hackathon</option>
              <option value="Workshop">Workshop</option>
              <option value="Seminar">Seminar</option>
              <option value="Sports">Seminar</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="institutionType">Institution Type *</label>
            <select
              id="institutionType"
              name="institutionType"
              value={formData.institutionType}
              onChange={handleChange}
              required
            >
              <option value="IIIT">IIIT</option>
              <option value="NIT">NIT</option>
              <option value="IIT">IIT</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="college">College Name *</label>
            <input
              type="text"
              id="college"
              name="college"
              value={formData.college}
              onChange={handleChange}
              required
              placeholder="e.g., IIIT Surat"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Event Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="5"
            placeholder="Describe your event in detail..."
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date">Start Date *</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="endDate">End Date</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="venue">Venue *</label>
            <input
              type="text"
              id="venue"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              required
              placeholder="e.g., Main Auditorium"
            />
          </div>

          <div className="form-group">
            <label htmlFor="organizer">Organizer *</label>
            <input
              type="text"
              id="organizer"
              name="organizer"
              value={formData.organizer}
              onChange={handleChange}
              required
              placeholder="e.g., Technical Club"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="contact">Contact Email *</label>
            <input
              type="email"
              id="contact"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              required
              placeholder="contact@example.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="registrationLink">Registration Link</label>
            <input
              type="url"
              id="registrationLink"
              name="registrationLink"
              value={formData.registrationLink}
              onChange={handleChange}
              placeholder="https://example.com/register"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="image">Event Image URL</label>
          <input
            type="url"
            id="image"
            name="image"
            value={formData.image}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Event'}
        </button>
      </form>
    </div>
  );
};

export default SubmitEvent;