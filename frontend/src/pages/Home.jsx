import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

const Home = () => {
  const institutions = [
    {
      type: 'IIITs',
      path: '/iiit',
      description: 'Indian Institutes of Information Technology',
      count: '12+ Institutes'
    },
    {
      type: 'NITs',
      path: '/nit',
      description: 'National Institutes of Technology',
      count: '31+ Institutes'
    },
    {
      type: 'IITs',
      path: '/iit',
      description: 'Indian Institutes of Technology',
      count: '23+ Institutes'
    }
  ];

  return (
    <div className="home-container">
      <section className="hero">
        <h1>Discover Events Across Premier Institutes</h1>
        <p>Your gateway to technical and cultural events at IIITs, NITs, and IITs</p>
      </section>

      <section className="institutions-section">
        <h2>Browse by Institution Type</h2>
        <div className="institutions-grid-home">
          {institutions.map((institution) => (
            <Link
              key={institution.type}
              to={institution.path}
              className="institution-card-home"
            >
              <div className="institution-content">
                <h3>{institution.type}</h3>
                <p className="institution-description">{institution.description}</p>
                <p className="institution-count">{institution.count}</p>
                <span className="explore-button">Explore →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="stats-section">
        <div className="stat-card">
          <h3>500+</h3>
          <p>Events Monthly</p>
        </div>
        <div className="stat-card">
          <h3>50+</h3>
          <p>Institutes</p>
        </div>
        <div className="stat-card">
          <h3>10K+</h3>
          <p>Students Reached</p>
        </div>
      </section>
    </div>
  );
};

export default Home;