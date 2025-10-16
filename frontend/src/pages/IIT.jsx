import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/InstitutionPage.css';

const IIT = () => {
  const iitColleges = [
    'IIT Bombay',
    'IIT Delhi',
    'IIT Madras',
    'IIT Kanpur',
    'IIT Kharagpur',
    'IIT Roorkee',
    'IIT Guwahati',
    'IIT Hyderabad',
    'IIT Indore',
    'IIT BHU',
    'IIT Gandhinagar',
    'IIT Jodhpur'
  ];

  const getCollegeSlug = (collegeName) => {
    return collegeName.toLowerCase().replace(/\s+/g, '-');
  };

  return (
    <div className="institution-page">
      <div className="institution-header">
        <Link to="/" className="back-button">← Back to Home</Link>
        <h1>Indian Institutes of Technology (IITs)</h1>
        <p>Explore events from premier IITs across India</p>
      </div>

      <div className="colleges-container">
        <h2>Select a College</h2>
        <div className="colleges-grid-page">
          {iitColleges.map((college) => (
            <Link
              key={college}
              to={`/iit/${getCollegeSlug(college)}`}
              className="college-card"
            >
              <div className="college-card-content">
                <h3>{college}</h3>
                <span className="arrow-icon">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IIT;