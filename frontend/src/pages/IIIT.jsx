import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/InstitutionPage.css';

const IIIT = () => {
  const iiitColleges = [
    'IIIT Surat',
    'IIIT Delhi',
    'IIIT Allahabad',
    'IIIT Bangalore',
    'IIIT Hyderabad',
    'IIIT Guwahati',
    'IIIT Vadodara',
    'IIIT Kota',
    'IIIT Lucknow',
    'IIIT Pune',
    'IIIT Kottayam',
    'IIIT Nagpur'
  ];

  // Convert college name to URL-friendly format
  const getCollegeSlug = (collegeName) => {
    return collegeName.toLowerCase().replace(/\s+/g, '-');
  };

  return (
    <div className="institution-page">
      <div className="institution-header">
        <Link to="/" className="back-button">← Back to Home</Link>
        <h1>Indian Institutes of Information Technology (IIITs)</h1>
        <p>Explore events from premier IIITs across India</p>
      </div>

      <div className="colleges-container">
        <h2>Select a College</h2>
        <div className="colleges-grid-page">
          {iiitColleges.map((college) => (
            <Link
              key={college}
              to={`/iiit/${getCollegeSlug(college)}`}
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

export default IIIT;