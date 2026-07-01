import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import { getNotifications, markAsRead, markAllAsRead, getUnreadCount } from '../services/notificationService';
import { Card } from './ui/Card';

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
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        className="relative p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
        onClick={handleToggle}
        aria-label="Notifications"
        id="notification-bell"
      >
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[1.25rem] h-5 px-1 text-[10px] font-bold text-white bg-danger border-2 border-white dark:border-slate-900 rounded-full" id="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <Card className="absolute right-0 mt-2 w-80 sm:w-96 overflow-hidden z-50 shadow-xl border border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                className="text-xs font-medium text-primary hover:text-primary-dark dark:hover:text-primary-light transition-colors"
                onClick={handleMarkAllRead}
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[350px] overflow-y-auto overscroll-contain">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary mb-2"></div>
                <span className="text-sm text-slate-500">Loading...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <span className="text-3xl mb-2 opacity-50">🔕</span>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">No notifications yet</p>
                <p className="text-xs text-slate-500 mt-1">Follow institutes & categories to get alerts!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {notifications.map(notification => (
                  <div
                    key={notification._id}
                    className={`group flex items-start gap-3 p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors ${!notification.read ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                    id={`notification-${notification._id}`}
                  >
                    <span className="flex-shrink-0 text-2xl h-10 w-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div className="flex-grow min-w-0 pr-2">
                      <p className={`text-sm truncate ${!notification.read ? 'font-semibold text-slate-900 dark:text-slate-100' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
                        {notification.title}
                      </p>
                      <p className={`text-xs mt-0.5 line-clamp-2 ${!notification.read ? 'text-slate-700 dark:text-slate-300 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                        {notification.message}
                      </p>
                      <span className="text-[10px] text-slate-400 font-medium mt-1 block uppercase tracking-wider">
                        {getTimeAgo(notification.createdAt)}
                      </span>
                    </div>
                    {!notification.read && (
                      <button
                        className="flex-shrink-0 w-2.5 h-2.5 rounded-full bg-primary mt-1 opacity-100 group-hover:scale-125 transition-transform"
                        onClick={(e) => handleMarkAsRead(notification._id, e)}
                        title="Mark as read"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <Link 
              to="/notifications" 
              className="block w-full text-center px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-slate-700 rounded-md transition-colors"
              onClick={() => setIsOpen(false)}
            >
              View all notifications
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
};

export default NotificationBell;
