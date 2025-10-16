import React from 'react';
import '../styles/About.css';

const About = () => {
  return (
    <div className="about-page">
      <div className="about-hero">
        <h1>About Eventopia</h1>
        <p>Democratizing access to technical and cultural opportunities</p>
      </div>

      <div className="about-content">
        <section className="about-section">
          <h2>Our Mission</h2>
          <p>
            Eventopia was created to bridge the gap between students and amazing events 
            happening across premier institutions in India. We believe that every student 
            deserves equal access to technical competitions, cultural festivals, workshops, 
            and seminars, regardless of which institution they attend.
          </p>
        </section>

        <section className="about-section">
          <h2>What We Do</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Event Discovery</h3>
              <p>Browse and discover upcoming events across IIITs, NITs, and IITs in one place.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📢</div>
              <h3>Easy Submission</h3>
              <p>Organizers can easily submit and manage their events on our platform.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔔</div>
              <h3>Stay Updated</h3>
              <p>Get notifications about events that match your interests and location.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🤝</div>
              <h3>Community</h3>
              <p>Connect with students from different institutions and expand your network.</p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>Our Impact</h2>
          <div className="impact-stats">
            <div className="impact-card">
              <h3>500+</h3>
              <p>Events Listed Monthly</p>
            </div>
            <div className="impact-card">
              <h3>50+</h3>
              <p>Partner Institutions</p>
            </div>
            <div className="impact-card">
              <h3>10,000+</h3>
              <p>Students Connected</p>
            </div>
            <div className="impact-card">
              <h3>100+</h3>
              <p>Cities Reached</p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>Technology Stack</h2>
          <div className="tech-stack">
            <span className="tech-badge">React</span>
            <span className="tech-badge">Node.js</span>
            <span className="tech-badge">MongoDB</span>
            <span className="tech-badge">Express</span>
            <span className="tech-badge">JavaScript</span>
          </div>
        </section>

        <section className="about-section cta-section">
          <h2>Join Us</h2>
          <p>
            Whether you're a student looking for opportunities or an organizer wanting 
            to reach a wider audience, Eventopia is here for you.
          </p>
          <div className="cta-buttons">
            <a href="/signup" className="btn-primary">Get Started</a>
            <a href="/submit" className="btn-secondary">Submit an Event</a>
          </div>
        </section>

        <section className="about-section contact-section">
          <h2>Get in Touch</h2>
          <p>Have questions or suggestions? We'd love to hear from you!</p>
          <div className="contact-info">
            <p>📧 Email: <a href="mailto:contact@eventopia.com">contact@eventopia.com</a></p>
            <p>🐦 Twitter: <a href="https://twitter.com/eventopia" target="_blank" rel="noopener noreferrer">@eventopia</a></p>
            <p>💼 LinkedIn: <a href="https://linkedin.com/company/eventopia" target="_blank" rel="noopener noreferrer">Eventopia</a></p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;