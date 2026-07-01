import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import EventCard from '../components/EventCard';
import { getUserEvents, getRegisteredEvents, getUserStats } from '../services/userService';
import { deleteEvent, getAllEvents } from '../services/eventService';
import { getUser, updateProfile, updatePassword, logout as apiLogout } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

const Profile = () => {
  const navigate = useNavigate();
  const { logout: authLogout } = useAuth();
  const [user, setUser] = useState(null);
  const [myEvents, setMyEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [recommendedEvents, setRecommendedEvents] = useState([]);
  const [stats, setStats] = useState({});
  const [activeTab, setActiveTab] = useState('overview'); // overview, submitted, registered, settings, subscriptions
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [passwordMode, setPasswordMode] = useState(false);

  const [editForm, setEditForm] = useState({
    name: '',
    college: '',
    institutionType: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const initProfile = async () => {
      setLoading(true);
      try {
        const userData = await getUser();
        setUser(userData);
        setEditForm({
          name: userData?.name || '',
          college: userData?.college || '',
          institutionType: userData?.institutionType || ''
        });
        await fetchUserData();
      } catch (error) {
        console.error('Failed to initialize profile:', error);
        setMessage({ type: 'error', text: 'Failed to load profile' });
      } finally {
        setLoading(false);
      }
    };
    initProfile();
  }, []);

  const fetchUserData = async () => {
    try {
      const [eventsRes, registeredRes, statsRes, allEventsRes] = await Promise.all([
        getUserEvents(),
        getRegisteredEvents(),
        getUserStats(),
        getAllEvents({ limit: 3 })
      ]);

      setMyEvents(eventsRes.events || []);
      setRegisteredEvents(registeredRes.events || []);
      setStats(statsRes.stats || {});
      setRecommendedEvents(allEventsRes.events?.slice(0, 3) || []);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setMessage({ type: 'error', text: 'Failed to load user data' });
    }
  };

  const handleEditChange = (e) => {
    setEditForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handlePasswordChange = (e) => {
    setPasswordForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(editForm);
      const updatedUser = await getUser();
      setUser(updatedUser);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setEditMode(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match!' });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters!' });
      return;
    }

    try {
      await updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setPasswordMode(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to update password' });
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteEvent(eventId);
        setMyEvents(myEvents.filter(event => event._id !== eventId));
        setMessage({ type: 'success', text: 'Event deleted successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } catch (error) {
        setMessage({ type: 'error', text: error.message || 'Failed to delete event' });
      }
    }
  };

  const handleLogout = async () => {
    try {
      await apiLogout();
      await authLogout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      setMessage({ type: 'error', text: 'Logout failed' });
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const sidebarLinks = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'submitted', label: 'My Events', icon: '📢' },
    { id: 'registered', label: 'Registered', icon: '🎫' },
    { id: 'subscriptions', label: 'Following Alerts', icon: '🔔' },
    { id: 'settings', label: 'Profile Settings', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900/50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <Card className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm">
            {/* Student avatar */}
            <div className="flex items-center gap-4 pb-6 mb-6 border-b border-slate-100 dark:border-slate-700">
              <div className="h-12 w-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xl font-bold shadow-md">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">{user?.name}</h2>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>

            {/* Sidebar Navigation */}
            <nav className="space-y-1">
              {sidebarLinks.map((link) => {
                const isActive = activeTab === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => {
                      setActiveTab(link.id);
                      setEditMode(false);
                      setPasswordMode(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive 
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <span>{link.icon}</span>
                    <span>{link.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 mt-6 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
            >
              <span>🚪</span>
              <span>Logout</span>
            </button>
          </Card>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          
          {/* Header Message Display */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-xl flex items-center ${message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>
              <span className="text-sm font-semibold">{message.text}</span>
            </div>
          )}

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Welcome back box */}
              <div className="bg-indigo-950 text-white rounded-3xl p-8 relative overflow-hidden shadow-lg shadow-indigo-950/25">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
                <div className="relative z-10">
                  <span className="text-xs uppercase tracking-wider text-indigo-300 font-bold">Student Dashboard</span>
                  <h1 className="text-3xl md:text-4xl font-extrabold mt-1 mb-2">Welcome back, {user?.name}!</h1>
                  <p className="text-indigo-200 text-sm max-w-xl">
                    Discover new hackathons, keep track of your registered college events, and configure following preferences for IIT, NIT, and IIIT alerts.
                  </p>
                </div>
              </div>

              {/* Quick Actions Grid */}
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 text-base uppercase tracking-wider">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Link to="/events" className="group">
                    <Card className="p-5 text-center flex flex-col items-center justify-center border border-slate-200 dark:border-slate-700 hover:border-indigo-300 transition-all rounded-2xl bg-white dark:bg-slate-800">
                      <span className="text-3xl mb-3 group-hover:scale-110 transition-transform">🔍</span>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200 block">Explore Events</span>
                    </Card>
                  </Link>
                  <button onClick={() => setActiveTab('registered')} className="group text-left w-full">
                    <Card className="p-5 text-center flex flex-col items-center justify-center border border-slate-200 dark:border-slate-700 hover:border-indigo-300 transition-all rounded-2xl bg-white dark:bg-slate-800 h-full">
                      <span className="text-3xl mb-3 group-hover:scale-110 transition-transform">🎫</span>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200 block">My Registrations</span>
                    </Card>
                  </button>
                  <Link to="/submit" className="group">
                    <Card className="p-5 text-center flex flex-col items-center justify-center border border-slate-200 dark:border-slate-700 hover:border-indigo-300 transition-all rounded-2xl bg-white dark:bg-slate-800">
                      <span className="text-3xl mb-3 group-hover:scale-110 transition-transform">📢</span>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200 block">Submit Event</span>
                    </Card>
                  </Link>
                  <button onClick={() => setActiveTab('subscriptions')} className="group text-left w-full">
                    <Card className="p-5 text-center flex flex-col items-center justify-center border border-slate-200 dark:border-slate-700 hover:border-indigo-300 transition-all rounded-2xl bg-white dark:bg-slate-800 h-full">
                      <span className="text-3xl mb-3 group-hover:scale-110 transition-transform">🔔</span>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200 block">Alert Settings</span>
                    </Card>
                  </button>
                </div>
              </div>

              {/* Upcoming / Active Registrations */}
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 text-base uppercase tracking-wider">Upcoming Registered Events</h3>
                {registeredEvents.length > 0 ? (
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                      {registeredEvents.slice(0, 4).map((event) => (
                        <div key={event._id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                          <div>
                            <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 mb-1.5">{event.type}</span>
                            <Link to={`/event/${event._id}`} className="font-bold text-slate-900 dark:text-slate-100 block hover:text-indigo-600 transition-colors leading-tight">{event.title}</Link>
                            <p className="text-xs text-slate-500 mt-1">{event.college} • {new Date(event.date).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="success">Registered</Badge>
                            <Link to={`/event/${event._id}`}>
                              <button className="px-4 py-2 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold text-xs rounded-lg transition-colors text-slate-700 dark:text-slate-300">
                                View Details
                              </button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Card className="p-8 text-center border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-2xl">
                    <p className="text-slate-500 text-sm mb-4">You have no upcoming registered events.</p>
                    <Link to="/events">
                      <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors shadow-md text-sm">
                        Explore Events
                      </button>
                    </Link>
                  </Card>
                )}
              </div>

              {/* Recommended Events */}
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 text-base uppercase tracking-wider">Recommended For You</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {recommendedEvents.map((event) => (
                    <EventCard key={event._id} event={event} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* MY EVENTS TAB */}
          {activeTab === 'submitted' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Submitted Events</h2>
                  <p className="text-sm text-slate-500">Events submitted by you for organizer approval</p>
                </div>
                <Link to="/submit">
                  <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors shadow-md text-sm">
                    + Submit Event
                  </button>
                </Link>
              </div>

              {myEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myEvents.map(event => (
                    <div key={event._id} className="flex flex-col h-full">
                      <EventCard event={event} />
                      <div className="mt-3 flex justify-between items-center bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 p-3.5 rounded-2xl shadow-sm">
                        <Badge variant={event.status === 'approved' ? 'success' : event.status === 'rejected' ? 'danger' : 'warning'}>
                          {event.status.toUpperCase()}
                        </Badge>
                        <button 
                          onClick={() => handleDeleteEvent(event._id)} 
                          className="px-3.5 py-1.5 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 text-xs font-bold rounded-lg transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm">
                  <span className="text-5xl mb-4 block">📢</span>
                  <p className="text-slate-500 mb-4 font-medium">You haven't submitted any events yet.</p>
                  <Link to="/submit">
                    <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm">
                      Submit Your First Event
                    </button>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* REGISTERED EVENTS TAB */}
          {activeTab === 'registered' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Registered Events</h2>
                <p className="text-sm text-slate-500">Your enrollment history for technical workshops and hackathons</p>
              </div>

              {registeredEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {registeredEvents.map(event => (
                    <EventCard key={event._id} event={event} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm">
                  <span className="text-5xl mb-4 block">🎫</span>
                  <p className="text-slate-500 mb-4 font-medium">You haven't registered for any events yet.</p>
                  <Link to="/events">
                    <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm">
                      Browse Events
                    </button>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* FOLLOWING ALERTS TAB */}
          {activeTab === 'subscriptions' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Following & Alerts</h2>
                <p className="text-sm text-slate-500">Configure following subscriptions for automatic notifications</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Following Summary Card */}
                <Card className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl">
                  <h3 className="text-lg font-bold flex items-center gap-2 mb-6 border-b border-slate-100 dark:border-slate-700 pb-3">
                    <span>📡</span> Following Status
                  </h3>
                  <div className="space-y-6 mb-8">
                    <div>
                      <strong className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">Institutes:</strong>
                      {user?.subscriptions?.subscribeAllInstitutes ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center text-sm"><svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> Following All Institutes</span>
                      ) : user?.subscriptions?.institutes?.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {user.subscriptions.institutes.map(c => (
                            <Badge key={c} variant="secondary">{c}</Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-sm italic">Not following any individual institutes</span>
                      )}
                    </div>
                    <div>
                      <strong className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">Institution Types:</strong>
                      {user?.subscriptions?.subscribeAllInstitutes ? (
                        <span className="text-slate-600 dark:text-slate-400 text-sm">All Types</span>
                      ) : user?.subscriptions?.institutionTypes?.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {user.subscriptions.institutionTypes.map(t => (
                            <Badge key={t} variant="primary">{t}</Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-sm italic">No institution types selected</span>
                      )}
                    </div>
                    <div>
                      <strong className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">Event Categories:</strong>
                      {user?.subscriptions?.categories?.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {user.subscriptions.categories.map(cat => (
                            <Badge key={cat} variant="warning">{cat}</Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-500 dark:text-slate-400 text-sm italic">All Categories (No filter)</span>
                      )}
                    </div>
                  </div>
                  <Link to="/settings/subscriptions" className="block w-full">
                    <button className="w-full py-2.5 border-2 border-indigo-500 hover:bg-indigo-50 text-indigo-600 dark:text-indigo-400 dark:hover:bg-indigo-950/20 text-sm font-semibold rounded-xl transition-colors">
                      Manage Following Settings
                    </button>
                  </Link>
                </Card>

                {/* Preferences Summary */}
                <Card className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl">
                  <h3 className="text-lg font-bold flex items-center gap-2 mb-6 border-b border-slate-100 dark:border-slate-700 pb-3">
                    <span>🔔</span> Alert Preferences
                  </h3>
                  <div className="space-y-4.5 mb-8">
                    {[
                      { key: 'inAppEnabled', label: 'In-App Alerts', desc: 'Alerts in the notification center panel' },
                      { key: 'emailEnabled', label: 'Email Alerts', desc: 'Direct email updates on events' },
                      { key: 'instantAlerts', label: 'Instant Alerts', desc: 'Realtime socket popup notifications' },
                      { key: 'dailyDigest', label: 'Daily Summary Digest', desc: 'A consolidated daily overview report' },
                    ].map((pref) => {
                      const isEnabled = user?.notificationPreferences?.[pref.key] !== false;
                      return (
                        <div key={pref.key} className="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-700 last:border-0 last:pb-0">
                          <div>
                            <span className="text-sm font-bold text-slate-800 dark:text-slate-200 block">{pref.label}</span>
                            <span className="text-[11px] text-slate-400">{pref.desc}</span>
                          </div>
                          <Badge variant={isEnabled ? 'success' : 'danger'}>
                            {isEnabled ? 'On' : 'Off'}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                  <Link to="/settings/notifications" className="block w-full">
                    <button className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors">
                      Configure Notifications
                    </button>
                  </Link>
                </Card>
              </div>
            </div>
          )}

          {/* PROFILE SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Profile Settings</h2>
                <p className="text-sm text-slate-500">Edit your user details and secure password credentials</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Personal Info Edit Card */}
                <Card className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl">
                  <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Personal Information</h3>
                    {!editMode && (
                      <button 
                        onClick={() => setEditMode(true)}
                        className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg transition-colors"
                      >
                        Edit Details
                      </button>
                    )}
                  </div>

                  {editMode ? (
                    <form className="space-y-4" onSubmit={handleUpdateProfile}>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                        <Input
                          type="text"
                          name="name"
                          value={editForm.name}
                          onChange={handleEditChange}
                          required
                          className="w-full rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">College/Institution</label>
                        <Input
                          type="text"
                          name="college"
                          value={editForm.college}
                          onChange={handleEditChange}
                          required
                          className="w-full rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Institution Type</label>
                        <select
                          name="institutionType"
                          value={editForm.institutionType}
                          onChange={handleEditChange}
                          required
                          className="w-full h-10 px-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-100"
                        >
                          <option value="IIIT">IIIT</option>
                          <option value="NIT">NIT</option>
                          <option value="IIT">IIT</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-700">
                        <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors">
                          Save Changes
                        </button>
                        <button type="button" onClick={() => setEditMode(false)} className="px-4 py-2 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 text-sm font-semibold rounded-lg transition-colors">
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4.5">
                      <div className="grid grid-cols-3 gap-4 py-2.5 border-b border-slate-50 dark:border-slate-800">
                        <span className="text-slate-400 text-sm font-medium">Name</span>
                        <span className="col-span-2 font-bold text-slate-800 dark:text-slate-200 text-sm">{user?.name}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 py-2.5 border-b border-slate-50 dark:border-slate-800">
                        <span className="text-slate-400 text-sm font-medium">Email</span>
                        <span className="col-span-2 font-semibold text-slate-800 dark:text-slate-200 text-sm">{user?.email}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 py-2.5 border-b border-slate-50 dark:border-slate-800">
                        <span className="text-slate-400 text-sm font-medium">College</span>
                        <span className="col-span-2 font-semibold text-slate-800 dark:text-slate-200 text-sm">{user?.college}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 py-2.5 border-b border-slate-50 dark:border-slate-800">
                        <span className="text-slate-400 text-sm font-medium">College Type</span>
                        <span className="col-span-2 font-semibold text-slate-800 dark:text-slate-200 text-sm">{user?.institutionType}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 py-2.5">
                        <span className="text-slate-400 text-sm font-medium">Account Role</span>
                        <span className="col-span-2 font-bold text-indigo-600 dark:text-indigo-400 text-sm capitalize">{user?.role}</span>
                      </div>
                    </div>
                  )}
                </Card>

                {/* Password Credentials Security Card */}
                <Card className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl h-max">
                  <div className="mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Security Credentials</h3>
                  </div>
                  {passwordMode ? (
                    <form className="space-y-4" onSubmit={handleUpdatePassword}>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
                        <Input
                          type="password"
                          name="currentPassword"
                          value={passwordForm.currentPassword}
                          onChange={handlePasswordChange}
                          required
                          placeholder="••••••••"
                          className="w-full rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">New Password</label>
                        <Input
                          type="password"
                          name="newPassword"
                          value={passwordForm.newPassword}
                          onChange={handlePasswordChange}
                          required
                          placeholder="••••••••"
                          className="w-full rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
                        <Input
                          type="password"
                          name="confirmPassword"
                          value={passwordForm.confirmPassword}
                          onChange={handlePasswordChange}
                          required
                          placeholder="••••••••"
                          className="w-full rounded-xl"
                        />
                      </div>
                      <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-700">
                        <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors">
                          Update Password
                        </button>
                        <button type="button" onClick={() => setPasswordMode(false)} className="px-4 py-2 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 text-sm font-semibold rounded-lg transition-colors">
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div>
                      <p className="text-slate-500 mb-5 text-sm leading-relaxed">Update password routinely to safeguard registration dashboard access.</p>
                      <button 
                        onClick={() => setPasswordMode(true)}
                        className="px-5 py-2.5 border-2 border-indigo-500 hover:bg-indigo-50 text-indigo-600 dark:text-indigo-400 dark:hover:bg-indigo-950/20 text-sm font-semibold rounded-xl transition-all"
                      >
                        Change Password
                      </button>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default Profile;