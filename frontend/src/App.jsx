import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import SubmitEvent from './pages/SubmitEvent';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Signup from './pages/Signup';

import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import About from './pages/About';
import IIIT from './pages/IIIT';
import NIT from './pages/NIT';
import IIT from './pages/IIT';
import Colleges from './pages/Colleges';
import Categories from './pages/Categories';
import CollegePage from './pages/CollegePage';
import NotificationCenter from './pages/NotificationCenter';
import SubscriptionSettings from './pages/SubscriptionSettings';
import NotificationSettings from './pages/NotificationSettings';
import ParticipantManager from './pages/ParticipantManager';
import NotificationBell from './components/NotificationBell';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { Button } from './components/ui/Button';

const ThemeToggleButton = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-md text-indigo-200 hover:text-white hover:bg-indigo-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
      aria-label="Toggle Dark Mode"
    >
      {isDarkMode ? '🌙' : '☀️'}
    </button>
  );
};

const AppContent = () => {
  const { user, loading } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [navSearchQuery, setNavSearchQuery] = useState('');
  const location = useLocation();
  const navigate = React.useCallback((path) => window.location.href = path, []);

  // Close mobile menu on route change
  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background dark:bg-background-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Explore Events', path: '/events' },
    { name: 'Submit Event', path: '/submit' },
    { name: 'Categories', path: '/categories' },
    { name: 'Colleges', path: '/colleges' },
  ];

  const handleNavSearch = (e) => {
    e.preventDefault();
    if (navSearchQuery.trim()) {
      window.location.href = `/events?search=${encodeURIComponent(navSearchQuery.trim())}`;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-background-dark text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full bg-indigo-950 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center gap-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded-md p-1">
                <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-white">
                  Eventopia
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex lg:items-center lg:space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-sm font-medium transition-colors hover:text-white ${
                    location.pathname === link.path 
                      ? 'text-white' 
                      : 'text-indigo-200'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Desktop Search + Actions */}
            <div className="hidden lg:flex items-center space-x-4">
              {/* Inline search */}
              <form onSubmit={handleNavSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search events, colleges..."
                  value={navSearchQuery}
                  onChange={(e) => setNavSearchQuery(e.target.value)}
                  className="w-56 xl:w-64 pl-9 pr-3 py-2 bg-indigo-900/60 border border-indigo-700/50 rounded-lg text-sm text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </form>

              <ThemeToggleButton />
              
              {user ? (
                <>
                  {isAdmin && (
                    <Link to="/admin" className="text-sm font-medium text-amber-300 hover:text-amber-200 transition-colors">
                      Admin
                    </Link>
                  )}
                  <NotificationBell />
                  <Link to="/profile">
                    <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold text-sm hover:bg-indigo-500 transition-colors border-2 border-indigo-400/30">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  </Link>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link to="/login" className="text-sm font-medium text-indigo-200 hover:text-white transition-colors">
                    Login
                  </Link>
                  <Link to="/signup">
                    <button className="px-5 py-2 bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-semibold rounded-lg transition-colors shadow-md shadow-indigo-500/25">
                      Get Started
                    </button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center lg:hidden space-x-3">
              {user && <NotificationBell />}
              <ThemeToggleButton />
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-indigo-200 hover:text-white hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-400"
                aria-expanded={isMobileMenuOpen}
              >
                <span className="sr-only">Open main menu</span>
                {!isMobileMenuOpen ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu panel */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-indigo-800 bg-indigo-950 absolute w-full shadow-lg z-50">
            <div className="px-4 pt-3 pb-4 space-y-1">
              {/* Mobile search */}
              <form onSubmit={handleNavSearch} className="mb-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={navSearchQuery}
                    onChange={(e) => setNavSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-indigo-900/60 border border-indigo-700/50 rounded-lg text-sm text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </form>

              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="block px-3 py-2.5 rounded-lg text-base font-medium text-indigo-100 hover:bg-indigo-800 hover:text-white transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              
              {user ? (
                <>
                  <Link to="/profile" className="block px-3 py-2.5 rounded-lg text-base font-medium text-indigo-100 hover:bg-indigo-800 hover:text-white">
                    Profile
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="block px-3 py-2.5 rounded-lg text-base font-medium text-amber-300 hover:bg-indigo-800">
                      Admin Panel
                    </Link>
                  )}
                </>
              ) : (
                <div className="pt-3 mt-2 border-t border-indigo-800 flex flex-col gap-2">
                  <Link to="/login" className="block px-3 py-2.5 rounded-lg text-base font-medium text-indigo-100 hover:bg-indigo-800 hover:text-white">
                    Login
                  </Link>
                  <Link to="/signup" className="block">
                    <button className="w-full px-4 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-semibold rounded-lg transition-colors">
                      Get Started
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/event/:id" element={<EventDetails />} />
          <Route path="/event/:id/participants" element={<ParticipantManager />} />
          <Route path="/submit" element={<SubmitEvent />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/about" element={<About />} />
          
          <Route path="/iiit" element={<IIIT />} />
          <Route path="/nit" element={<NIT />} />
          <Route path="/iit" element={<IIT />} />
          <Route path="/colleges" element={<Colleges />} />
          <Route path="/categories" element={<Categories />} />
          
          <Route path="/iiit/:collegeName" element={<CollegePage />} />
          <Route path="/nit/:collegeName" element={<CollegePage />} />
          <Route path="/iit/:collegeName" element={<CollegePage />} />

          <Route path="/notifications" element={<NotificationCenter />} />
          <Route path="/settings/subscriptions" element={<SubscriptionSettings />} />
          <Route path="/settings/notifications" element={<NotificationSettings />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-slate-300 mt-auto">
        {/* Main footer content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">

            {/* Brand Column */}
            <div className="lg:col-span-2 space-y-5">
              <Link to="/" className="inline-block">
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-blue-400">
                  Eventopia
                </span>
              </Link>
              <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
                Eventopia works to provide every engineering student with access to technical events, cultural fests, hackathons, and workshops happening across IITs, NITs, IIITs, and other premier institutions in India.
              </p>
              {/* Social icons row */}
              <div className="flex items-center gap-3 pt-2">
                <a href="https://twitter.com/eventopia" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="w-9 h-9 rounded-full bg-slate-800 hover:bg-primary flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="https://linkedin.com/company/eventopia" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-9 h-9 rounded-full bg-slate-800 hover:bg-primary flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                <a href="https://instagram.com/eventopia" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-9 h-9 rounded-full bg-slate-800 hover:bg-primary flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
                <a href="mailto:contact@eventopia.com" aria-label="Email" className="w-9 h-9 rounded-full bg-slate-800 hover:bg-primary flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                </a>
              </div>
            </div>

            {/* About Us Column */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">About Us</h3>
              <ul className="space-y-3">
                <li><Link to="/about" className="text-sm text-slate-400 hover:text-white transition-colors">Our Story</Link></li>
                <li><Link to="/about" className="text-sm text-slate-400 hover:text-white transition-colors">Our Mission</Link></li>
                <li><Link to="/about" className="text-sm text-slate-400 hover:text-white transition-colors">Our Impact</Link></li>
                <li><Link to="/about" className="text-sm text-slate-400 hover:text-white transition-colors">Contact Us</Link></li>
              </ul>
            </div>

            {/* Explore Column */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">Explore</h3>
              <ul className="space-y-3">
                <li><Link to="/events" className="text-sm text-slate-400 hover:text-white transition-colors">Browse Events</Link></li>
                <li><Link to="/submit" className="text-sm text-slate-400 hover:text-white transition-colors">Submit an Event</Link></li>
                <li><Link to="/notifications" className="text-sm text-slate-400 hover:text-white transition-colors">Notifications</Link></li>
                <li><Link to="/settings/subscriptions" className="text-sm text-slate-400 hover:text-white transition-colors">Subscriptions</Link></li>
              </ul>
            </div>

            {/* Institutes Column */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">Institutes</h3>
              <ul className="space-y-3">
                <li><Link to="/iit" className="text-sm text-slate-400 hover:text-white transition-colors">IITs</Link></li>
                <li><Link to="/nit" className="text-sm text-slate-400 hover:text-white transition-colors">NITs</Link></li>
                <li><Link to="/iiit" className="text-sm text-slate-400 hover:text-white transition-colors">IIITs</Link></li>
              </ul>
            </div>

          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500">
              &copy; {new Date().getFullYear()} Eventopia. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/about" className="text-xs text-slate-500 hover:text-white transition-colors">Privacy Policy</Link>
              <span className="text-slate-700">|</span>
              <Link to="/about" className="text-xs text-slate-500 hover:text-white transition-colors">Terms &amp; Conditions</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <AppContent />
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;