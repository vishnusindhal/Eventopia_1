import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/InstitutionPage.css';

const NIT = () => {
  const nitColleges = [
    'NIT Trichy',
    'NIT Warangal',
    'NIT Surathkal',
    'NIT Calicut',
    'NIT Rourkela',
    'NIT Jaipur',
    'NIT Kurukshetra',
    'NIT Durgapur',
    'NIT Silchar',
    'NIT Hamirpur',
    'NIT Jalandhar',
    'NIT Allahabad'
  ];

  const getCollegeSlug = (collegeName) => {
    return collegeName.toLowerCase().replace(/\s+/g, '-');
  };

  return (
    <div className="institution-page">
      <div className="institution-header">
        <Link to="/" className="back-button">← Back to Home</Link>
        <h1>National Institutes of Technology (NITs)</h1>
        <p>Explore events from premier NITs across India</p>
      </div>

      <div className="colleges-container">
        <h2>Select a College</h2>
        <div className="colleges-grid-page">
          {nitColleges.map((college) => (
            <Link
              key={college}
              to={`/nit/${getCollegeSlug(college)}`}
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

export default NIT;