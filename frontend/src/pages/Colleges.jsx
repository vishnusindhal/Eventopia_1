import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { IIT_COLLEGES, NIT_COLLEGES, IIIT_COLLEGES } from '../config/colleges';

const Colleges = () => {
  const getCollegeSlug = (collegeName) => {
    return collegeName.toLowerCase().replace(/\s+/g, '-');
  };

  const sections = [
    {
      title: 'Indian Institutes of Technology (IITs)',
      description: 'Explore technical events, hackathons, and symposiums hosted by premier IIT campuses across India.',
      type: 'iit',
      colleges: IIT_COLLEGES,
      badgeColor: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300',
    },
    {
      title: 'National Institutes of Technology (NITs)',
      description: 'Discover coding contests, technical workshops, and fests organized by prestigious NIT campuses.',
      type: 'nit',
      colleges: NIT_COLLEGES,
      badgeColor: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
    },
    {
      title: 'Indian Institutes of Information Technology (IIITs)',
      description: 'Find specialized developer events, hackathons, and webinars hosted by state-of-the-art IIIT centers.',
      type: 'iiit',
      colleges: IIIT_COLLEGES,
      badgeColor: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
    }
  ];

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="mb-12 text-center pb-6 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-slate-100 mb-4 tracking-tight">
          Participating Colleges
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Browse events categorized by premier engineering institutions in India. Select any college to see its active events.
        </p>
      </div>

      {/* College Sections */}
      <div className="space-y-16">
        {sections.map((section) => (
          <div key={section.type} className="scroll-mt-20">
            <div className="mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-3">
                    {section.title}
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${section.badgeColor}`}>
                      {section.colleges.length} campuses
                    </span>
                  </h2>
                  <p className="text-sm text-slate-500 mt-1 max-w-3xl">
                    {section.description}
                  </p>
                </div>
                <Link to={`/${section.type}`}>
                  <button className="px-4 py-2 border border-indigo-500 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 text-xs font-bold rounded-lg transition-colors whitespace-nowrap">
                    View Separate Page →
                  </button>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {section.colleges.map((college) => (
                <Link
                  key={college}
                  to={`/${section.type}/${getCollegeSlug(college)}`}
                  className="block group"
                >
                  <Card className="h-full p-5 hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 group-hover:-translate-y-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 flex items-center justify-between rounded-xl">
                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-sm">
                        {college}
                      </h3>
                      <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">
                        {section.type.toUpperCase()} Campus
                      </p>
                    </div>
                    <span className="text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all duration-300 text-sm">
                      →
                    </span>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Colleges;
