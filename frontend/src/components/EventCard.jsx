import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';

const EventCard = ({ event }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'TBA';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const isOnline = event.venue?.toLowerCase().includes('online') || event.venue?.toLowerCase().includes('http');
  const mode = isOnline ? 'Online' : 'Offline';
  
  const isRegistrationOpen = !event.registrationDeadline || new Date(event.registrationDeadline) > new Date();

  return (
    <Card className="flex flex-col h-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden group hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300">
      {/* Card Header with Image/Placeholder */}
      <div className="relative h-44 bg-gradient-to-br from-indigo-100 to-blue-50 dark:from-indigo-900/30 dark:to-slate-800 overflow-hidden">
        {event.image && event.image !== 'https://via.placeholder.com/800x400' ? (
          <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-indigo-300 group-hover:scale-105 transition-transform duration-500">
            <svg className="w-12 h-12 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge variant="primary">{event.type}</Badge>
          <Badge variant={mode === 'Online' ? 'success' : 'warning'}>{mode}</Badge>
        </div>
        <div className="absolute top-3 right-3">
          <button className="p-2 rounded-full bg-white/90 dark:bg-slate-900/80 text-slate-500 hover:text-indigo-600 backdrop-blur-sm transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" aria-label="Bookmark Event">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug mb-3">
          {event.title}
        </h3>

        <div className="space-y-2.5 mb-5 flex-grow">
          {/* Date */}
          <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
            <svg className="w-4 h-4 mr-2.5 text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <span>{formatDate(event.date)}</span>
            {event.registrationDeadline && (
              <span className="text-slate-400 dark:text-slate-500"> — {formatDate(event.registrationDeadline)}</span>
            )}
          </div>
          
          {/* College */}
          <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
            <svg className="w-4 h-4 mr-2.5 text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            <span className="truncate font-medium">{event.college}</span>
            {event.institutionType && (
              <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold uppercase bg-indigo-100 dark:bg-indigo-900/40 rounded text-indigo-600 dark:text-indigo-300">
                {event.institutionType}
              </span>
            )}
          </div>

          {/* Venue */}
          {event.venue && (
            <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
              <svg className="w-4 h-4 mr-2.5 text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <span className="truncate">{event.venue}</span>
            </div>
          )}

          {/* Fee */}
          {event.fee !== undefined && (
            <div className="flex items-center text-sm font-semibold text-slate-700 dark:text-slate-300">
              <span className="text-indigo-500 mr-2.5">₹</span>
              <span>{event.fee === 0 ? 'Free' : `₹${event.fee}`}</span>
            </div>
          )}
        </div>

        {/* Register Button */}
        <Link to={`/event/${event._id || event.id}`} className="block mt-auto">
          <button
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
              isRegistrationOpen
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
            }`}
            disabled={!isRegistrationOpen}
          >
            {isRegistrationOpen ? 'Register Now' : 'Registration Closed'}
          </button>
        </Link>
      </div>
    </Card>
  );
};

export default EventCard;