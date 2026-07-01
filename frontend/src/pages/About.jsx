import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const About = () => {
  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen">
      {/* Hero Section */}
      <div className="bg-primary text-white py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Abstract background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern)" />
          </svg>
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
            About Eventopia
          </h1>
          <p className="text-xl sm:text-2xl font-medium text-primary-100 max-w-2xl mx-auto">
            Democratizing access to technical and cultural opportunities across India.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 space-y-24">
        
        {/* Mission Section */}
        <section className="text-center max-w-3xl mx-auto animate-in fade-in duration-700 delay-100">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6">Our Mission</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            Eventopia was created to bridge the gap between students and amazing events 
            happening across premier institutions in India. We believe that every student 
            deserves equal access to technical competitions, cultural festivals, workshops, 
            and seminars, regardless of which institution they attend.
          </p>
        </section>

        {/* Features Section */}
        <section>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-10 text-center">What We Do</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: '🎯', title: 'Event Discovery', desc: 'Browse and discover upcoming events across IIITs, NITs, and IITs in one place.' },
              { icon: '📢', title: 'Easy Submission', desc: 'Organizers can easily submit and manage their events on our platform.' },
              { icon: '🔔', title: 'Stay Updated', desc: 'Get notifications about events that match your interests and location.' },
              { icon: '🤝', title: 'Community', desc: 'Connect with students from different institutions and expand your network.' }
            ].map((feature, i) => (
              <Card key={i} className="p-8 text-center hover:shadow-lg hover:border-primary/50 transition-all duration-300 hover:-translate-y-1">
                <div className="text-4xl mb-4 bg-slate-100 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Impact Section */}
        <section className="bg-slate-900 dark:bg-slate-950 text-white rounded-3xl p-8 sm:p-12 md:p-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-primary/20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-secondary/20 blur-3xl"></div>
          
          <div className="relative z-10 text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Impact</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Connecting students and opportunities across the nation.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center relative z-10">
            {[
              { stat: '500+', label: 'Events Listed Monthly' },
              { stat: '50+', label: 'Partner Institutions' },
              { stat: '10k+', label: 'Students Connected' },
              { stat: '100+', label: 'Cities Reached' }
            ].map((item, i) => (
              <div key={i} className="p-4">
                <div className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tight">{item.stat}</div>
                <div className="text-sm md:text-base text-slate-400 font-medium">{item.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Tech Stack */}
        <section className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-8">Built With Modern Technologies</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {['React', 'Node.js', 'MongoDB', 'Express', 'Tailwind CSS', 'Vite'].map((tech) => (
              <span key={tech} className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-slate-700 dark:text-slate-300 font-medium shadow-sm hover:shadow-md hover:border-primary transition-all cursor-default">
                {tech}
              </span>
            ))}
          </div>
        </section>

        {/* CTA & Contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <section className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-2xl p-8 sm:p-10 text-center md:text-left">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">Join Eventopia</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg">
              Whether you're a student looking for opportunities or an organizer wanting 
              to reach a wider audience, we're here for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button as={Link} to="/signup" size="lg" className="w-full sm:w-auto">
                Get Started
              </Button>
              <Button as={Link} to="/submit" variant="outline" size="lg" className="w-full sm:w-auto">
                Submit an Event
              </Button>
            </div>
          </section>

          <section className="bg-surface dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-2xl p-8 sm:p-10">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">Get in Touch</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8">
              Have questions or suggestions? We'd love to hear from you!
            </p>
            <div className="space-y-4">
              <a href="mailto:contact@eventopia.com" className="flex items-center p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                <span className="text-2xl mr-4 bg-slate-100 dark:bg-slate-800 w-12 h-12 flex items-center justify-center rounded-full group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors">📧</span>
                <div>
                  <div className="text-sm text-slate-500 font-medium">Email</div>
                  <div className="text-slate-900 dark:text-slate-100 font-medium">contact@eventopia.com</div>
                </div>
              </a>
              <a href="https://twitter.com/eventopia" target="_blank" rel="noopener noreferrer" className="flex items-center p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                <span className="text-2xl mr-4 bg-slate-100 dark:bg-slate-800 w-12 h-12 flex items-center justify-center rounded-full group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors">🐦</span>
                <div>
                  <div className="text-sm text-slate-500 font-medium">Twitter</div>
                  <div className="text-slate-900 dark:text-slate-100 font-medium">@eventopia</div>
                </div>
              </a>
              <a href="https://linkedin.com/company/eventopia" target="_blank" rel="noopener noreferrer" className="flex items-center p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                <span className="text-2xl mr-4 bg-slate-100 dark:bg-slate-800 w-12 h-12 flex items-center justify-center rounded-full group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors">💼</span>
                <div>
                  <div className="text-sm text-slate-500 font-medium">LinkedIn</div>
                  <div className="text-slate-900 dark:text-slate-100 font-medium">Eventopia</div>
                </div>
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About;