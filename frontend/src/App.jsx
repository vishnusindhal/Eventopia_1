import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import SubmitEvent from './pages/SubmitEvent';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import IIIT from './pages/IIIT';
import NIT from './pages/NIT';
import IIT from './pages/IIT';
import CollegePage from './pages/CollegePage';
import './styles/App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="nav-container">
            <Link to="/" className="logo">
              <h1>Eventopia</h1>
            </Link>
            <ul className="nav-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/events">All Events</Link></li>
              <li><Link to="/submit">Submit Event</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/login" className="btn-login">Login</Link></li>
            </ul>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/event/:id" element={<EventDetails />} />
          <Route path="/submit" element={<SubmitEvent />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/about" element={<About />} />
          
          {/* Institution Type Pages */}
          <Route path="/iiit" element={<IIIT />} />
          <Route path="/nit" element={<NIT />} />
          <Route path="/iit" element={<IIT />} />
          
          {/* Individual College Pages */}
          <Route path="/iiit/:collegeName" element={<CollegePage />} />
          <Route path="/nit/:collegeName" element={<CollegePage />} />
          <Route path="/iit/:collegeName" element={<CollegePage />} />
        </Routes>

        <footer className="footer">
          <p>&copy; 2024 Eventopia. Democratizing access to technical events.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;