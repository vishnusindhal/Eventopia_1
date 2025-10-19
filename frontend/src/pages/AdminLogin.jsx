import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login, getUser } from '../services/authService';
import '../styles/AdminLogin.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await login(formData);
      const user = getUser();
      
      // Check if user is admin
      if (user?.role === 'admin') {
        navigate('/admin');
      } else {
        setError('Access denied. This account is not an admin account.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-container">
        <div className="admin-login-card">
          <div className="admin-badge">
            <span className="admin-icon">🔐</span>
            <h1>Admin Portal</h1>
          </div>
          <p className="admin-subtitle">Sign in to access the admin dashboard</p>

          {error && <div className="admin-error-message">{error}</div>}

          <form className="admin-login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Admin Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="admin@eventopia.com"
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter admin password"
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="admin-login-button" disabled={loading}>
              {loading ? 'Signing in...' : '🔓 Sign In as Admin'}
            </button>
          </form>

          <div className="admin-login-footer">
            <p className="admin-note">
              ⚠️ This portal is for administrators only. 
              Unauthorized access is prohibited.
            </p>
            <Link to="/login" className="user-login-link">
              ← Regular User Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;