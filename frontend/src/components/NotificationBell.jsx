import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import { getNotifications, markAsRead, markAllAsRead, getUnreadCount } from '../services/notificationService';
import '../styles/NotificationBell.css';

const NotificationBell = () => {
  const navigate = useNavigate();
  const { unreadCount, setUnreadCount, addNotificationListener } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch initial unread count + latest notifications
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [notifRes, countRes] = await Promise.all([
        getNotifications({ page: 1, limit: 5 }),
        getUnreadCount()
      ]);
      setNotifications(notifRes.notifications || []);
      setUnreadCount(countRes.count || 0);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [setUnreadCount]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Listen for real-time notifications
  useEffect(() => {
    const unsubscribe = addNotificationListener((notification) => {
      setNotifications(prev => [notification, ...prev].slice(0, 5));
    });
    return unsubscribe;
  }, [addNotificationListener]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen(prev => !prev);
  };

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      try {
        await markAsRead(notification._id);
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (err) { /* ignore */ }
    }
    setIsOpen(false);
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_event': return '🎯';
      case 'deadline_reminder': return '⏰';
      case 'event_update': return '📝';
      case 'registration_reminder': return '🔔';
      case 'event_cancelled': return '❌';
      default: return '💬';
    }
  };

  return (
    <div className="notification-bell-wrapper" ref={dropdownRef}>
      <button
        className="notification-bell-btn"
        onClick={handleToggle}
        aria-label="Notifications"
        id="notification-bell"
      >
        <svg className="bell-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="notification-badge" id="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown" id="notification-dropdown">
          <div className="notification-dropdown-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button className="mark-all-read-btn" onClick={handleMarkAllRead}>
                Mark all read
              </button>
            )}
          </div>

          <div className="notification-dropdown-body">
            {loading ? (
              <div className="notification-loading">
                <div className="spinner-small" />
                <span>Loading...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="notification-empty">
                <span className="empty-icon">🔔</span>
                <p>No notifications yet</p>
                <span className="empty-sub">Follow institutes & categories to get alerts!</span>
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification._id}
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                  id={`notification-${notification._id}`}
                >
                  <span className="notification-icon-emoji">
                    {getNotificationIcon(notification.type)}
                  </span>
                  <div className="notification-content">
                    <p className="notification-title">{notification.title}</p>
                    <p className="notification-message">{notification.message}</p>
                    <span className="notification-time">{getTimeAgo(notification.createdAt)}</span>
                  </div>
                  {!notification.read && (
                    <button
                      className="mark-read-dot"
                      onClick={(e) => handleMarkAsRead(notification._id, e)}
                      title="Mark as read"
                    />
                  )}
                </div>
              ))
            )}
          </div>

          <div className="notification-dropdown-footer">
            <Link to="/notifications" onClick={() => setIsOpen(false)}>
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
