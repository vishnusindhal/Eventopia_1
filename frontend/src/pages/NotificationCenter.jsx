import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications
} from '../services/notificationService';
import '../styles/NotificationCenter.css';

const NotificationCenter = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setUnreadCount, addNotificationListener } = useSocket();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread' | 'read'
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [totalCount, setTotalCount] = useState(0);

  const fetchNotifications = useCallback(async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const readFilter = filter === 'unread' ? 'false' : filter === 'read' ? 'true' : undefined;

      const res = await getNotifications({
        page: pageNum,
        limit: 15,
        read: readFilter,
        search: search || undefined
      });

      const newNotifs = res.notifications || [];

      if (append) {
        setNotifications(prev => [...prev, ...newNotifs]);
      } else {
        setNotifications(newNotifs);
      }

      setTotalCount(res.pagination?.total || 0);
      setHasMore(pageNum < (res.pagination?.pages || 1));
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filter, search]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setPage(1);
    fetchNotifications(1, false);
  }, [user, filter, search, fetchNotifications, navigate]);

  // Listen for real-time notifications
  useEffect(() => {
    const unsubscribe = addNotificationListener((notification) => {
      setNotifications(prev => [notification, ...prev]);
      setTotalCount(prev => prev + 1);
    });
    return unsubscribe;
  }, [addNotificationListener]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNotifications(nextPage, true);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const handleMarkAsRead = async (id) => {
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

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      const deleted = notifications.find(n => n._id === id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      setTotalCount(prev => prev - 1);
      if (deleted && !deleted.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const handleDeleteAll = async () => {
    try {
      await deleteAllNotifications();
      setNotifications([]);
      setTotalCount(0);
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to delete all notifications:', err);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await handleMarkAsRead(notification._id);
    }
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hour${Math.floor(diff / 3600) > 1 ? 's' : ''} ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
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
    <div className="nc-page">
      <div className="nc-container">
        {/* ── Header ───────────────────────────────────────────── */}
        <div className="nc-header">
          <div className="nc-header-left">
            <h1>Notifications</h1>
            <span className="nc-count">{totalCount} total</span>
          </div>
          <div className="nc-header-actions">
            <button className="nc-btn nc-btn-secondary" onClick={handleMarkAllRead}>
              ✓ Mark all read
            </button>
            <button className="nc-btn nc-btn-danger" onClick={handleDeleteAll}>
              🗑 Clear all
            </button>
          </div>
        </div>

        {/* ── Search & Filters ─────────────────────────────────── */}
        <div className="nc-toolbar">
          <form className="nc-search-form" onSubmit={handleSearch}>
            <div className="nc-search-input-wrapper">
              <svg className="nc-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                className="nc-search-input"
                placeholder="Search notifications..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                id="notification-search"
              />
            </div>
          </form>

          <div className="nc-filter-tabs">
            {['all', 'unread', 'read'].map(f => (
              <button
                key={f}
                className={`nc-filter-tab ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* ── Notification List ────────────────────────────────── */}
        <div className="nc-list">
          {loading ? (
            <div className="nc-loading">
              <div className="nc-spinner" />
              <p>Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="nc-empty">
              <span className="nc-empty-icon">🔔</span>
              <h3>No notifications</h3>
              <p>You're all caught up! Follow institutes and categories to start receiving alerts.</p>
              <button className="nc-btn nc-btn-primary" onClick={() => navigate('/settings/subscriptions')}>
                Manage Following
              </button>
            </div>
          ) : (
            <>
              {notifications.map(notification => (
                <div
                  key={notification._id}
                  className={`nc-item ${!notification.read ? 'nc-item-unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                  id={`nc-item-${notification._id}`}
                >
                  <div className="nc-item-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="nc-item-body">
                    <div className="nc-item-header">
                      <h4 className="nc-item-title">{notification.title}</h4>
                      {!notification.read && <span className="nc-unread-dot" />}
                    </div>
                    <p className="nc-item-message">{notification.message}</p>
                    <div className="nc-item-meta">
                      <span className="nc-item-time">{getTimeAgo(notification.createdAt)}</span>
                      <span className="nc-item-type">{notification.type?.replace(/_/g, ' ')}</span>
                    </div>
                  </div>
                  <div className="nc-item-actions">
                    {!notification.read && (
                      <button
                        className="nc-action-btn"
                        onClick={(e) => { e.stopPropagation(); handleMarkAsRead(notification._id); }}
                        title="Mark as read"
                      >
                        ✓
                      </button>
                    )}
                    <button
                      className="nc-action-btn nc-action-delete"
                      onClick={(e) => { e.stopPropagation(); handleDelete(notification._id); }}
                      title="Delete"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}

              {hasMore && (
                <div className="nc-load-more">
                  <button
                    className="nc-btn nc-btn-secondary"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                  >
                    {loadingMore ? 'Loading...' : 'Load more'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
