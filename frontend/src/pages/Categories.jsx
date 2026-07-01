import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { EVENT_CATEGORIES } from '../config/colleges';

const categoryDetails = {
  'Hackathon': {
    icon: '💻',
    description: 'Solve real-world challenges, build prototypes, and compete in collaborative coding marathons.',
    color: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-100 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400'
  },
  'Workshop': {
    icon: '🔧',
    description: 'Hands-on practical training sessions covering specialized technical skills, tools, and platforms.',
    color: 'bg-emerald-55 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400'
  },
  'Seminar': {
    icon: '📖',
    description: 'Academic lectures, theoretical presentations, and research discussions led by field experts.',
    color: 'bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900/50 text-amber-600 dark:text-amber-400'
  },
  'Technical': {
    icon: '🚀',
    description: 'General core engineering and technology-related events, symposia, and lab challenges.',
    color: 'bg-blue-50 dark:bg-blue-950/40 border-blue-100 dark:border-blue-900/50 text-blue-600 dark:text-blue-400'
  },
  'Cultural': {
    icon: '🎭',
    description: 'Fine arts, dance, music, theater, and other non-technical college student community events.',
    color: 'bg-rose-50 dark:bg-rose-950/40 border-rose-100 dark:border-rose-900/50 text-rose-600 dark:text-rose-400'
  },
  'Webinar': {
    icon: '🌐',
    description: 'Online virtual seminars, tech talks, guest lectures, and panel discussions on current trends.',
    color: 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-100 dark:border-cyan-900/50 text-cyan-600 dark:text-cyan-400'
  },
  'Competition': {
    icon: '🏆',
    description: 'Competitive student events, design challenges, pitching contests, and engineering matches.',
    color: 'bg-purple-50 dark:bg-purple-950/40 border-purple-100 dark:border-purple-900/50 text-purple-600 dark:text-purple-400'
  },
  'Internship': {
    icon: '💼',
    description: 'Student internship postings, training programs, summer internships, and industry roles.',
    color: 'bg-teal-50 dark:bg-teal-950/40 border-teal-100 dark:border-teal-900/50 text-teal-600 dark:text-teal-400'
  },
  'Placement Drive': {
    icon: '🏢',
    description: 'College recruitment events, job drives, interviews, and corporate campus hirings.',
    color: 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
  },
  'Tech Fest': {
    icon: '🎪',
    description: 'Annual college-wide grand technical festivals housing multiple symposia, competitions, and exhibitions.',
    color: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-100 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400'
  },
  'Cultural Fest': {
    icon: '🎶',
    description: 'Large-scale college cultural festivals hosting concerts, artistic performances, and social gatherings.',
    color: 'bg-rose-50 dark:bg-rose-950/40 border-rose-100 dark:border-rose-900/50 text-rose-600 dark:text-rose-400'
  },
  'Sports': {
    icon: '⚽',
    description: 'College athletic meets, football, basketball, cricket tournaments, and active track and field events.',
    color: 'bg-orange-50 dark:bg-orange-950/40 border-orange-100 dark:border-orange-900/50 text-orange-600 dark:text-orange-400'
  },
  'Sports Event': {
    icon: '🏆',
    description: 'Specific inter-college or intra-college athletic matches and sports meets.',
    color: 'bg-orange-50 dark:bg-orange-950/40 border-orange-100 dark:border-orange-900/50 text-orange-600 dark:text-orange-400'
  },
  'Coding Contest': {
    icon: '💻',
    description: 'Algorithm challenges, competitive programming contests, and timed online debugging sprints.',
    color: 'bg-violet-50 dark:bg-violet-950/40 border-violet-100 dark:border-violet-900/50 text-violet-600 dark:text-violet-400'
  },
  'Research Program': {
    icon: '🔬',
    description: 'Academic research calls, project positions, labs, papers publishing, and academic fellowship programs.',
    color: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400'
  },
  'Open Source Program': {
    icon: '🐙',
    description: 'Developer programs highlighting open-source code contributions, Git tasks, and project mentorship.',
    color: 'bg-sky-50 dark:bg-sky-950/40 border-sky-100 dark:border-sky-900/50 text-sky-600 dark:text-sky-400'
  },
  'Scholarship': {
    icon: '🎓',
    description: 'Student financial assistance programs, academic grants, rewards, and research funding calls.',
    color: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-100 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400'
  }
};

const Categories = () => {
  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="mb-12 text-center pb-6 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-slate-100 mb-4 tracking-tight">
          Event Categories
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Explore and filter college opportunities by technical or non-technical domains. Select any category to view its active events.
        </p>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {EVENT_CATEGORIES.map((category) => {
          const detail = categoryDetails[category] || {
            icon: '📂',
            description: 'Discover events and challenges belonging to this specialized category.',
            color: 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
          };
          return (
            <Link
              key={category}
              to={`/events?type=${encodeURIComponent(category)}`}
              className="block group h-full"
            >
              <Card className="h-full p-6 hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 group-hover:-translate-y-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 flex flex-col rounded-2xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border ${detail.color.split(' ')[0]} ${detail.color.split(' ')[1]} ${detail.color.split(' ')[2]} transition-transform group-hover:scale-110`}>
                    {detail.icon}
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-base">
                    {category}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex-grow leading-relaxed">
                  {detail.description}
                </p>
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  <span>Browse Events</span>
                  <span className="group-hover:translate-x-1 transition-transform duration-300">
                    →
                  </span>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Categories;
