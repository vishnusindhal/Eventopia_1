import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getEventById, registerForEvent } from '../services/eventService';
import { isAuthenticated } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [activeTab, setActiveTab] = useState('about');
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  // Countdown timer
  useEffect(() => {
    if (!event?.date) return;
    const target = new Date(event.date).getTime();
    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, target - now);
      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [event?.date]);

  const fetchEventDetails = async () => {
    setLoading(true);
    try {
      const response = await getEventById(id);
      setEvent(response.event);
    } catch (error) {
      console.error('Error fetching event details:', error);
      setEvent(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    setRegistering(true);
    try {
      await registerForEvent(id);
      alert('Successfully registered for the event!');
      fetchEventDetails();
    } catch (error) {
      alert(error.message || 'Failed to register for event');
    } finally {
      setRegistering(false);
    }
  };

  const formatDate = (dateString, includeTime = false) => {
    if (!dateString) return 'TBA';
    const options = { year: 'numeric', month: 'long', day: 'numeric', ...(includeTime && { hour: '2-digit', minute: '2-digit' }) };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Event not found</h2>
        <p className="text-slate-500 mb-6">The event you're looking for doesn't exist or has been removed.</p>
        <Link to="/events">
          <button className="px-6 py-2.5 border-2 border-indigo-500 text-indigo-600 dark:text-indigo-300 font-semibold rounded-xl hover:bg-indigo-500 hover:text-white transition-all text-sm">
            Back to Events
          </button>
        </Link>
      </div>
    );
  }

  const isOnline = event.venue?.toLowerCase().includes('online') || event.venue?.toLowerCase().includes('http');
  const mode = isOnline ? 'Online' : 'Offline';
  const isRegistrationOpen = !event.registrationDeadline || new Date(event.registrationDeadline) > new Date();
  const isOwner = user && event.createdBy && (user.id === event.createdBy._id || user._id === event.createdBy._id);

  const tabs = [
    { id: 'about', label: 'About' },
    ...(event.schedule?.length ? [{ id: 'timeline', label: 'Timeline' }] : []),
    ...(event.highlights?.length ? [{ id: 'highlights', label: 'Highlights' }] : []),
    ...(isOwner ? [{ id: 'participants', label: 'Participants' }] : []),
  ];

  return (
    <div className="animate-in fade-in duration-300 -mx-4 sm:-mx-6 lg:-mx-8">
      
      {/* Hero Banner */}
      <div className="relative w-full h-[320px] md:h-[420px] overflow-hidden">
        {event.image && event.image !== 'https://via.placeholder.com/800x400' ? (
          <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-800 to-slate-900"></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20"></div>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 leading-tight max-w-4xl uppercase">
            {event.title}
          </h1>
          <p className="text-lg md:text-xl font-medium opacity-80 mb-8">{event.college}</p>

          {/* Countdown Timer */}
          <div className="flex gap-4 md:gap-6 mb-8">
            {[
              { value: countdown.days, label: 'Days' },
              { value: countdown.hours, label: 'Hours' },
              { value: countdown.minutes, label: 'Minutes' },
              { value: countdown.seconds, label: 'Seconds' },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                  <span className="text-2xl md:text-3xl font-bold">{String(item.value).padStart(2, '0')}</span>
                </div>
                <span className="text-xs mt-2 opacity-70 uppercase tracking-wider">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleRegister}
              disabled={registering || !isRegistrationOpen}
              className={`px-8 py-3.5 rounded-xl font-semibold text-sm transition-all ${
                isRegistrationOpen
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30'
                  : 'bg-slate-500 text-slate-300 cursor-not-allowed'
              }`}
            >
              {registering ? 'Processing...' : (isRegistrationOpen ? 'Register Now' : 'Registration Closed')}
            </button>
            <button className="p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-colors" aria-label="Bookmark">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
            <button className="p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-colors" aria-label="Share">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Event Meta Bar */}
        <div className="flex flex-wrap gap-6 items-center mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            <span className="font-medium">{event.college}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <span>{event.venue}</span>
          </div>
          <div className="flex gap-2">
            <Badge variant="primary">{event.type}</Badge>
            <Badge variant={mode === 'Online' ? 'success' : 'warning'}>{mode}</Badge>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 items-start">

          {/* Main Content */}
          <div className="flex-1 w-full">

            {/* Tabs */}
            <div className="flex gap-1 mb-8 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'about' && (
              <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {event.description}
              </div>
            )}

            {activeTab === 'timeline' && event.schedule?.length > 0 && (
              <div className="space-y-4">
                {event.schedule.map((item, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg text-indigo-700 dark:text-indigo-300 font-bold text-sm flex-shrink-0">
                      {item.time}
                    </div>
                    <div className="text-slate-700 dark:text-slate-300 font-medium">{item.activity}</div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'highlights' && event.highlights?.length > 0 && (
              <ul className="grid sm:grid-cols-2 gap-3">
                {event.highlights.map((highlight, index) => (
                  <li key={index} className="flex items-start p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <svg className="w-5 h-5 mr-3 text-indigo-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    <span className="text-slate-700 dark:text-slate-300">{highlight}</span>
                  </li>
                ))}
              </ul>
            )}

            {activeTab === 'participants' && isOwner && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100">Registered Participants</h3>
                  <Badge variant="primary">{event.registeredUsers?.length || 0}</Badge>
                </div>
                {event.registeredUsers?.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {event.registeredUsers.map(student => (
                      <div key={student._id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                        <span className="font-semibold text-slate-900 dark:text-slate-100 block">{student.name}</span>
                        <span className="text-sm text-slate-500">{student.email}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                    <p className="text-slate-500">No students have registered yet.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sticky Sidebar */}
          <aside className="w-full lg:w-[360px] flex-shrink-0 sticky top-24 space-y-6">
            
            {/* Registration Details */}
            <Card className="p-6 bg-white dark:bg-slate-800 border-2 border-indigo-100 dark:border-indigo-900/50 rounded-2xl">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-5">Registration Details</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-sm text-slate-500">Registration Fee</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{event.fee === 0 || !event.fee ? 'Free' : `₹${event.fee}`}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-sm text-slate-500">Deadline</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{formatDate(event.registrationDeadline)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-sm text-slate-500">Organizer</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{event.organizer}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-slate-500">Contact</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm break-all">{event.contact}</span>
                </div>
              </div>

              <button
                onClick={handleRegister}
                disabled={registering || !isRegistrationOpen}
                className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all ${
                  isRegistrationOpen
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                }`}
              >
                {registering ? 'Processing...' : (isRegistrationOpen ? 'Register Now' : 'Registration Closed')}
              </button>
            </Card>

            {/* Back to Events */}
            <Link to="/events" className="flex items-center justify-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
              Back to Events
            </Link>
          </aside>

        </div>
      </div>
    </div>
  );
};

export default EventDetails;