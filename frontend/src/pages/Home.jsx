import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

const Home = () => {
  const institutions = [
    {
      type: 'IIITs',
      path: '/iiit',
      description: 'Indian Institutes of Information Technology',
      count: '12+ Institutes',
      icon: '🎓',
      color: 'blue'
    },
    {
      type: 'NITs',
      path: '/nit',
      description: 'National Institutes of Technology',
      count: '31+ Institutes',
      icon: '🏛️',
      color: 'purple'
    },
    {
      type: 'IITs',
      path: '/iit',
      description: 'Indian Institutes of Technology',
      count: '23+ Institutes',
      icon: '🎯',
      color: 'red'
    }
  ];

  const features = [
    {
      icon: '🔍',
      title: 'Easy Discovery',
      description: 'Find events from top institutions in one place'
    },
    {
      icon: '📅',
      title: 'Stay Updated',
      description: 'Never miss out on exciting opportunities'
    },
    {
      icon: '🎉',
      title: 'Join Events',
      description: 'Register for events with a single click'
    },
    {
      icon: '🚀',
      title: 'Submit Events',
      description: 'Share your events with thousands of students'
    }
  ];

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-text">✨ Welcome to Eventopia</span>
          </div>
          <h1 className="hero-title">
            Discover Amazing Events
            <span className="gradient-text"> Across Premier Institutes</span>
          </h1>
          <p className="hero-description">
            Your gateway to technical competitions, cultural festivals, workshops, 
            and seminars at IIITs, NITs, and IITs across India
          </p>
          <div className="hero-buttons">
            <Link to="/events" className="btn-primary-hero">
              <span>Browse Events</span>
              <span className="btn-arrow">→</span>
            </Link>
            <Link to="/submit" className="btn-secondary-hero">
              <span>Submit Event</span>
              <span className="btn-icon">📝</span>
            </Link>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="floating-elements">
          <div className="float-element float-1">🎓</div>
          <div className="float-element float-2">🎨</div>
          <div className="float-element float-3">💻</div>
          <div className="float-element float-4">🎯</div>
          <div className="float-element float-5">🏆</div>
          <div className="float-element float-6">📚</div>
        </div>
      </section>

      {/* Institutions Section */}
      <section className="institutions-section">
        <div className="section-header">
          <h2 className="section-title">Browse by Institution</h2>
          <p className="section-subtitle">Select an institution type to explore events</p>
        </div>
        
        <div className="institutions-grid">
          {institutions.map((institution, index) => (
            <Link
              key={institution.type}
              to={institution.path}
              className={`institution-card card-${institution.color}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="card-glow"></div>
              <div className="card-icon">{institution.icon}</div>
              <h3 className="card-title">{institution.type}</h3>
              <p className="card-description">{institution.description}</p>
              <div className="card-footer">
                <span className="card-count">{institution.count}</span>
                <span className="card-arrow">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2 className="section-title">Why Choose Eventopia?</h2>
          <p className="section-subtitle">Everything you need to discover and manage events</p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="feature-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <h3 className="stat-number">500+</h3>
            <p className="stat-label">Events Monthly</p>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🏫</div>
            <h3 className="stat-number">50+</h3>
            <p className="stat-label">Partner Institutes</p>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <h3 className="stat-number">10K+</h3>
            <p className="stat-label">Active Students</p>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🌟</div>
            <h3 className="stat-number">100+</h3>
            <p className="stat-label">Cities Covered</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Get Started?</h2>
          <p className="cta-description">
            Join thousands of students discovering amazing events every day
          </p>
          <div className="cta-buttons">
            <Link to="/signup" className="btn-cta-primary">
              Create Account
            </Link>
            <Link to="/events" className="btn-cta-secondary">
              Explore Events
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;