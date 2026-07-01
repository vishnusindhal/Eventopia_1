import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import EventCard from '../components/EventCard';
import { getAllEvents } from '../services/eventService';

const Events = () => {
  const [searchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: searchParams.get('type') || 'all',
    search: searchParams.get('search') || ''
  });

  // Re-sync filters when URL search params change (e.g. navigating from Categories page)
  useEffect(() => {
    const urlType = searchParams.get('type');
    const urlSearch = searchParams.get('search');
    setFilters(prev => ({
      type: urlType || prev.type,
      search: urlSearch ?? prev.search
    }));
  }, [searchParams]);

  useEffect(() => {
    fetchAllEvents();
  }, [filters]);

  const fetchAllEvents = async () => {
    setLoading(true);
    try {
      const filterParams = {};
      if (filters.type !== 'all') filterParams.type = filters.type;
      if (filters.search) filterParams.search = filters.search;

      const response = await getAllEvents(filterParams);
      setEvents(response.events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const categories = [
    { label: 'All Events', value: 'all' },
    { label: 'Technical', value: 'Technical' },
    { label: 'Cultural', value: 'Cultural' },
    { label: 'Hackathon', value: 'Hackathon' },
    { label: 'Workshop', value: 'Workshop' },
    { label: 'Seminar', value: 'Seminar' },
    { label: 'Sports', value: 'Sports' },
    { label: 'Webinar', value: 'Webinar' },
    { label: 'Competition', value: 'Competition' },
    { label: 'Internship', value: 'Internship' },
    { label: 'Placement Drive', value: 'Placement Drive' },
    { label: 'Tech Fest', value: 'Tech Fest' },
    { label: 'Cultural Fest', value: 'Cultural Fest' },
    { label: 'Sports Event', value: 'Sports Event' },
    { label: 'Coding Contest', value: 'Coding Contest' },
    { label: 'Research Program', value: 'Research Program' },
    { label: 'Open Source Program', value: 'Open Source Program' },
    { label: 'Scholarship', value: 'Scholarship' },
  ];

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="pb-6 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">Explore Events</h1>
        <p className="text-slate-500 dark:text-slate-400">Discover and register for amazing events across India</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-72 flex-shrink-0 space-y-6">
          {/* Search */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-3 text-sm uppercase tracking-wider">Search</h2>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search events..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4 text-sm uppercase tracking-wider">Categories</h2>
            <div className="flex flex-col gap-1">
              {categories.map((category) => {
                const isActive = filters.type === category.value;
                return (
                  <label
                    key={category.value}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                      isActive 
                        ? 'bg-indigo-50 dark:bg-indigo-900/30' 
                        : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                      isActive
                        ? 'bg-indigo-600 border-indigo-600'
                        : 'border-slate-300 dark:border-slate-500'
                    }`}>
                      {isActive && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <input
                      type="radio"
                      name="category"
                      value={category.value}
                      checked={isActive}
                      onChange={() => handleFilterChange('type', category.value)}
                      className="sr-only"
                    />
                    <span className={`text-sm font-medium ${
                      isActive 
                        ? 'text-indigo-700 dark:text-indigo-300' 
                        : 'text-slate-600 dark:text-slate-400'
                    }`}>
                      {category.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Clear Filters */}
          {(filters.type !== 'all' || filters.search) && (
            <button
              onClick={() => {
                handleFilterChange('search', '');
                handleFilterChange('type', 'all');
              }}
              className="w-full py-2.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
            >
              Clear All Filters
            </button>
          )}
        </aside>

        {/* Events Grid */}
        <div className="flex-1 w-full">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl h-[420px]"></div>
              ))}
            </div>
          ) : events.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {events.map(event => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">No events found</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">We couldn't find any events matching your current filters. Try adjusting your search.</p>
              <button
                onClick={() => {
                  handleFilterChange('search', '');
                  handleFilterChange('type', 'all');
                }}
                className="px-6 py-2.5 border-2 border-indigo-500 text-indigo-600 dark:text-indigo-300 font-semibold rounded-xl hover:bg-indigo-500 hover:text-white transition-all text-sm"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Events;