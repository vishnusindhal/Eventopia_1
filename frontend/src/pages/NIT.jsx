import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';

const NIT = () => {
  const nitColleges = [
    'NIT Trichy',
    'NIT Warangal',
    'NIT Surathkal',
    'NIT Calicut',
    'NIT Rourkela',
    'NIT Jaipur',
    'NIT Kurukshetra',
    'NIT Durgapur',
    'NIT Silchar',
    'NIT Hamirpur',
    'NIT Jalandhar',
    'NIT Allahabad'
  ];

  const getCollegeSlug = (collegeName) => {
    return collegeName.toLowerCase().replace(/\s+/g, '-');
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-300">
      <div className="mb-12 text-center relative pt-8 pb-6 border-b border-slate-200 dark:border-slate-800">
        <Link 
          to="/" 
          className="absolute left-0 top-0 inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors bg-slate-100 dark:bg-slate-800/50 px-3 py-1.5 rounded-full"
        >
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-slate-100 mb-4 tracking-tight mt-6 sm:mt-0">
          National Institutes of Technology (NITs)
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Explore events from premier NITs across India
        </p>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
          Select a College
          <span className="bg-primary/10 text-primary text-sm py-0.5 px-2.5 rounded-full">
            {nitColleges.length}
          </span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {nitColleges.map((college) => (
            <Link
              key={college}
              to={`/nit/${getCollegeSlug(college)}`}
              className="block group"
            >
              <Card className="h-full p-5 hover:border-primary hover:shadow-md transition-all duration-300 group-hover:-translate-y-1 bg-surface dark:bg-surface-dark border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors">
                  {college}
                </h3>
                <span className="text-slate-400 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300">
                  →
                </span>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NIT;