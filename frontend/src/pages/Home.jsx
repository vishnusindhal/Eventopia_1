import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';
import { getSubscriptions, updateSubscriptions } from '../services/subscriptionService';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [subscribedColleges, setSubscribedColleges] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      getSubscriptions()
        .then(res => {
          setSubscribedColleges(res.subscriptions?.institutes || []);
        })
        .catch(err => console.error('Error fetching subscriptions:', err));
    } else {
      setSubscribedColleges([]);
    }
  }, [user]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/events?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleFollow = async (collegeName, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      navigate('/login');
      return;
    }

    const isFollowing = subscribedColleges.includes(collegeName);
    const updated = isFollowing 
      ? subscribedColleges.filter(c => c !== collegeName)
      : [...subscribedColleges, collegeName];

    try {
      const res = await getSubscriptions();
      const subs = res.subscriptions || {};
      
      await updateSubscriptions({
        institutes: updated,
        institutionTypes: subs.institutionTypes || [],
        categories: subs.categories || [],
        subscribeAllInstitutes: subs.subscribeAllInstitutes || false
      });

      setSubscribedColleges(updated);
    } catch (err) {
      console.error('Failed to update subscription:', err);
    }
  };

  const popularSearches = ['Hackathons', 'Workshops', 'AI', 'Web Dev', 'ML', 'Cyber Security'];

  const categories = [
    { name: 'Hackathons', icon: '💻', color: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300', query: 'type=Hackathon' },
    { name: 'Coding Contest', icon: '🏆', color: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300', query: 'type=Coding Contest' },
    { name: 'Workshops', icon: '🔧', color: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300', query: 'type=Workshop' },
    { name: 'Conferences', icon: '🎤', color: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300', query: 'search=Conference' },
    { name: 'Seminars', icon: '📖', color: 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300', query: 'type=Seminar' },
    { name: 'Bootcamps', icon: '🚀', color: 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-300', query: 'search=Bootcamp' },
    { name: 'AI', icon: '🤖', color: 'bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-300', query: 'search=AI' },
    { name: 'Cloud Computing', icon: '☁️', color: 'bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-300', query: 'search=Cloud' },
    { name: 'Cyber Security', icon: '🔒', color: 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300', query: 'search=Cyber' },
    { name: 'Data Science', icon: '📊', color: 'bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-300', query: 'search=Data' },
    { name: 'Web Development', icon: '🌐', color: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300', query: 'search=Web' },
    { name: 'Robotics', icon: '🤖', color: 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-300', query: 'search=Robotics' },
  ];

  const trendingColleges = [
    { name: 'IIT Bombay', events: 132, followers: '15.1K', path: '/iit/iit-bombay', type: 'IIT' },
    { name: 'IIT Hyderabad', events: 98, followers: '10.5K', path: '/iit/iit-hyderabad', type: 'IIT' },
    { name: 'NIT Trichy', events: 85, followers: '8.2K', path: '/nit/nit-trichy', type: 'NIT' },
    { name: 'IIIT Surat', events: 45, followers: '4.8K', path: '/iiit/iiit-surat', type: 'IIIT' },
    { name: 'IIT Delhi', events: 120, followers: '18.5K', path: '/iit/iit-delhi', type: 'IIT' },
    { name: 'NIT Warangal', events: 72, followers: '6.2K', path: '/nit/nit-warangal', type: 'NIT' },
  ];

  const stats = [
    { value: '1000+', label: 'Events', icon: '📅' },
    { value: '250+', label: 'Colleges', icon: '🏫' },
    { value: '50K+', label: 'Students', icon: '👥' },
    { value: '25+', label: 'Categories', icon: '📂' },
  ];

  return (
    <div className="flex flex-col animate-in fade-in duration-500">
      
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-100 dark:bg-indigo-900/20 rounded-full blur-3xl -mr-48 -mt-48 opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl -ml-32 -mb-32 opacity-60"></div>
        
        <div className="relative max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text content */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                India's Largest Engineering Events Platform
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 mb-6 leading-[1.1]">
                Discover Every{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">
                  Engineering Event
                </span>{' '}
                In India
              </h1>
              
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-lg leading-relaxed">
                Find hackathons, workshops, tech talks, fests and more happening in IITs, NITs, IIITs and top colleges across India.
              </p>
              
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="flex gap-2 mb-5">
                <div className="relative flex-1">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search events, colleges, technologies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm shadow-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="px-7 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors shadow-md shadow-indigo-500/25 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search
                </button>
              </form>

              {/* Popular Searches */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Popular Searches:</span>
                {popularSearches.map(tag => (
                  <Link
                    key={tag}
                    to={`/events?search=${encodeURIComponent(tag)}`}
                    className="px-3 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/40 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right: Decorative illustration area */}
            <div className="hidden lg:flex justify-center items-center relative">
              <div className="w-80 h-80 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-3xl rotate-6 opacity-90 shadow-2xl shadow-indigo-500/30"></div>
              <div className="absolute w-72 h-72 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-3xl -rotate-6 opacity-80 shadow-xl"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white z-10">
                  <div className="text-7xl mb-4">🎓</div>
                  <p className="text-xl font-bold">Events Await</p>
                  <p className="text-sm opacity-80">Explore & Register</p>
                </div>
              </div>
              
              {/* Floating cards */}
              <div className="absolute -top-4 -left-4 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-3 flex items-center gap-3 animate-bounce-slow z-20 border border-slate-100 dark:border-slate-700">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg flex items-center justify-center text-lg">🏆</div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">IIT Bombay</p>
                  <p className="text-[10px] text-slate-500">24 May 2024</p>
                </div>
              </div>
              
              <div className="absolute -bottom-2 -right-4 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-3 flex items-center gap-3 z-20 border border-slate-100 dark:border-slate-700">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg flex items-center justify-center text-lg">💡</div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Tech Talk</p>
                  <p className="text-[10px] text-slate-500">NIT Trichy</p>
                </div>
              </div>

              <div className="absolute top-1/2 -right-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-3 flex items-center gap-3 z-20 border border-slate-100 dark:border-slate-700">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 rounded-lg flex items-center justify-center text-lg">🤖</div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">AI Workshop</p>
                  <p className="text-[10px] text-slate-500">IIT Hyderabad</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-indigo-950 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <span className="text-3xl">{stat.icon}</span>
                <h3 className="text-3xl md:text-4xl font-extrabold text-white">{stat.value}</h3>
                <p className="text-sm font-medium text-indigo-300">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section id="categories" className="py-16 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">Popular Categories</h2>
              <p className="text-slate-500 mt-1">Explore events by categories</p>
            </div>
            <Link to="/events" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
              View All
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
            </Link>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                to={`/events?${cat.query}`}
                className="group flex flex-col items-center gap-3 p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-200 hover:-translate-y-1"
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${cat.color} transition-transform group-hover:scale-110`}>
                  {cat.icon}
                </div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 text-center leading-tight">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Colleges */}
      <section id="colleges" className="py-16 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-800/30 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">Trending Colleges</h2>
              <p className="text-slate-500 mt-1">Colleges with most active events</p>
            </div>
            <div className="flex gap-2">
              <Link to="/iit" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">View All →</Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingColleges.map((college) => (
              <Card 
                key={college.name} 
                onClick={() => navigate(college.path)}
                className="p-6 flex flex-col items-center text-center hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-200 hover:-translate-y-1 cursor-pointer"
              >
                {/* College avatar */}
                <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-2xl font-bold text-indigo-600 dark:text-indigo-300 mb-4 border-2 border-indigo-200 dark:border-indigo-700">
                  {college.name.charAt(0)}
                </div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1">{college.name}</h3>
                <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                  <span>{college.events} Events</span>
                  <span>•</span>
                  <span>{college.followers} Followers</span>
                </div>
                <span className="inline-block px-3 py-0.5 text-[10px] font-bold uppercase rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 mb-4">
                  {college.type}
                </span>
                <button 
                  onClick={(e) => handleFollow(college.name, e)}
                  className={`px-6 py-2 border-2 font-semibold rounded-lg transition-all text-sm ${
                    subscribedColleges.includes(college.name)
                      ? 'bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700'
                      : 'border-indigo-500 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-500 hover:text-white'
                  }`}
                >
                  {subscribedColleges.includes(college.name) ? 'Following' : 'Follow'}
                </button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-indigo-950 text-white rounded-3xl overflow-hidden relative">
            <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 p-10 md:p-16 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-lg text-indigo-200 mb-8 max-w-2xl mx-auto">
                Join thousands of students discovering amazing technical events and hackathons every day.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/signup">
                  <button className="px-8 py-3.5 bg-white text-indigo-900 font-semibold rounded-xl hover:bg-slate-100 transition-colors shadow-lg text-sm">
                    Create Account
                  </button>
                </Link>
                <Link to="/events">
                  <button className="px-8 py-3.5 border-2 border-indigo-400 text-white font-semibold rounded-xl hover:bg-indigo-800 transition-colors text-sm">
                    Browse Events
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;