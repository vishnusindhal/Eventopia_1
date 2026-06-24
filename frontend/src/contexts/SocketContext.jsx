import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { API_ORIGIN } from '../config/api';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  // Notification state managed at socket level for real-time updates
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestNotification, setLatestNotification] = useState(null);

  // Listeners that other components can subscribe to
  const listenersRef = useRef(new Set());

  const addNotificationListener = useCallback((fn) => {
    listenersRef.current.add(fn);
    return () => listenersRef.current.delete(fn);
  }, []);

  useEffect(() => {
    // Only connect when user is logged in
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    // Retrieve token from the axios default header
    const authHeader =
      // eslint-disable-next-line no-underscore-dangle
      window.__eventopiaToken || '';

    const socket = io(API_ORIGIN, {
      auth: { token: authHeader },
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket.id);
      setIsConnected(true);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.warn('[Socket] Connection error:', err.message);
    });

    // ── Handle incoming notifications ─────────────────────────
    socket.on('new-notification', (notification) => {
      console.log('[Socket] New notification:', notification);
      setUnreadCount(prev => prev + 1);
      setLatestNotification(notification);

      // Notify all registered listeners
      listenersRef.current.forEach(fn => {
        try { fn(notification); } catch (e) { /* ignore */ }
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [user]);

  const value = {
    socket: socketRef.current,
    isConnected,
    unreadCount,
    setUnreadCount,
    latestNotification,
    addNotificationListener
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export default SocketContext;
