import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import EventCard from '../components/EventCard';
import { getEventsByCollege } from '../services/eventService';
import { Button } from '../components/ui/Button';

const CollegePage = () => {
  const { collegeName } = useParams();
  const location = useLocation();
  const resolvedInstitutionType = location.pathname.split('/')[1] || '';
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const UPPERCASE_WORDS = ['iit', 'nit', 'iiit', 'bhu'];

  const formatCollegeName = (slug) => {
    if (!slug) return '';
    return slug
      .split('-')
      .map(word => {
        if (UPPERCASE_WORDS.includes(word.toLowerCase())) {
          return word.toUpperCase();
        }
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');
  };

  const displayName = formatCollegeName(collegeName);

  useEffect(() => {
    fetchCollegeEvents();
  }, [collegeName]);

  const fetchCollegeEvents = async () => {
    setLoading(true);
    setError('');
    try {
      // Ensure collegeName exists before calling the API
      if (!collegeName) {
        console.warn('collegeName is missing, skipping API call.');
        setEvents([]);
        return;
      }
      
      const response = await getEventsByCollege(collegeName);
      
      if (response && response.events) {
        // Filter to show only approved events
        const approvedEvents = response.events.filter(event => event.status === 'approved');
        setEvents(approvedEvents);
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to load events. Please try again later.');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-300">
      <div className="mb-10 text-center relative pt-8 pb-4">
        <Link 
          to={`/${resolvedInstitutionType || ''}`} 
          className="absolute left-0 top-0 inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors bg-slate-100 dark:bg-slate-800/50 px-3 py-1.5 rounded-full"
        >
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to {resolvedInstitutionType ? `${resolvedInstitutionType.toUpperCase()}s` : 'List'}
        </Link>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-slate-100 mb-4 tracking-tight mt-6 sm:mt-0">
          {displayName}
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Upcoming events and activities
        </p>
      </div>

      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
            <p className="text-slate-500 font-medium">Loading events...</p>
          </div>
        ) : error ? (
          <div className="bg-danger/5 border border-danger/20 rounded-xl p-8 max-w-lg mx-auto text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-danger mb-2">Oops! Something went wrong</h3>
            <p className="text-danger/80 mb-6">{error}</p>
            <Button onClick={fetchCollegeEvents} variant="outline" className="border-danger text-danger hover:bg-danger/10">
              Try Again
            </Button>
          </div>
        ) : events.length > 0 ? (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center mb-6 border-b border-slate-200 dark:border-slate-800 pb-4 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  Upcoming Events 
                  <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm py-0.5 px-2.5 rounded-full">
                    {events.length}
                  </span>
                </h2>
                <p className="text-slate-500 text-sm mt-1">All approved events at {displayName}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {events.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-surface dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-2xl p-10 max-w-2xl mx-auto text-center shadow-sm">
            <div className="text-6xl mb-6 opacity-80">📅</div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">No Events Yet</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
              There are no approved events scheduled for {displayName} at the moment. Be the first to add one!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Button as={Link} to="/submit" className="w-full sm:w-auto">
                📝 Submit an Event
              </Button>
              <Button as={Link} to="/events" variant="outline" className="w-full sm:w-auto">
                🔍 Browse All Events
              </Button>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 inline-block">
              <p className="text-sm text-slate-500 flex items-center justify-center gap-2">
                💡 <strong>Note:</strong> Submitted events appear here after admin approval.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollegePage;