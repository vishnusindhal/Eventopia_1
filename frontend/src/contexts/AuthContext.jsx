import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { isAuthenticated, getUser } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkAuth = async () => {
    try {
      const authenticated = await isAuthenticated();
      if (authenticated) {
        const userData = await getUser();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      setError(err.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (userData) => {
    // Accept a token (preferred) or a user object. If token is provided,
    // ensure axios has the Authorization header and fetch the current user.
    try {
      if (typeof userData === 'string') {
        // treat as token
        api.defaults.headers.common['Authorization'] = `Bearer ${userData}`;
        await checkAuth();
      } else if (userData && userData.id) {
        // direct user object
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('AuthContext.login error:', err);
      setUser(null);
    }
  };

  const logout = () => {
    setUser(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    checkAuth
  };

  if (loading) {
    return <div className="auth-loading">Loading...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;