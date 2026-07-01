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
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

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
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-300">
      
      {/* ── Header ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-3">
            Notifications
            <span className="text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-3 py-1 rounded-full">
              {totalCount} total
            </span>
          </h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            ✓ Mark all read
          </Button>
          <Button variant="outline" size="sm" onClick={handleDeleteAll} className="text-danger border-danger hover:bg-danger/10">
            🗑 Clear all
          </Button>
        </div>
      </div>

      {/* ── Search & Filters ─────────────────────────────────── */}
      <div className="bg-surface dark:bg-surface-dark border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <form className="w-full md:w-1/2 relative" onSubmit={handleSearch}>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <Input
            type="text"
            className="w-full pl-10"
            placeholder="Search notifications..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            id="notification-search"
          />
        </form>

        <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg w-full md:w-auto overflow-x-auto">
          {['all', 'unread', 'read'].map(f => (
            <button
              key={f}
              className={`flex-1 md:flex-none px-4 py-2 text-sm font-medium rounded-md transition-colors capitalize whitespace-nowrap ${
                filter === f 
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── Notification List ────────────────────────────────── */}
      <Card className="overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[400px]">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mb-4"></div>
            <p className="text-slate-500">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-center px-4">
            <span className="text-6xl mb-4 opacity-50">🔕</span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">No notifications</h3>
            <p className="text-slate-500 max-w-sm mb-6">You're all caught up! Follow institutes and categories to start receiving alerts.</p>
            <Button onClick={() => navigate('/settings/subscriptions')}>
              Manage Following
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {notifications.map(notification => (
              <div
                key={notification._id}
                className={`flex gap-4 p-5 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group ${!notification.read ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                onClick={() => handleNotificationClick(notification)}
                id={`nc-item-${notification._id}`}
              >
                <div className="flex-shrink-0 text-3xl h-12 w-12 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`text-base font-semibold truncate pr-4 ${!notification.read ? 'text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-300'}`}>
                      {notification.title}
                    </h4>
                    <span className="text-xs text-slate-400 whitespace-nowrap mt-1">
                      {getTimeAgo(notification.createdAt)}
                    </span>
                  </div>
                  
                  <p className={`text-sm mb-2 line-clamp-2 ${!notification.read ? 'text-slate-700 dark:text-slate-300 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                    {notification.message}
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 capitalize">
                      {notification.type?.replace(/_/g, ' ')}
                    </span>
                    {!notification.read && (
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex-shrink-0 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!notification.read && (
                    <button
                      className="p-1.5 text-slate-400 hover:text-success hover:bg-success/10 rounded-md transition-colors"
                      onClick={(e) => { e.stopPropagation(); handleMarkAsRead(notification._id); }}
                      title="Mark as read"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  )}
                  <button
                    className="p-1.5 text-slate-400 hover:text-danger hover:bg-danger/10 rounded-md transition-colors"
                    onClick={(e) => { e.stopPropagation(); handleDelete(notification._id); }}
                    title="Delete"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}

            {hasMore && (
              <div className="p-6 text-center">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? 'Loading...' : 'Load more notifications'}
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default NotificationCenter;
