import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getEventParticipants, downloadParticipantPDF, downloadParticipantCSV } from '../services/eventService';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';

const ParticipantManager = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [eventInfo, setEventInfo] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [downloadingCSV, setDownloadingCSV] = useState(false);
  const [toast, setToast] = useState({ type: '', text: '' });
  const limit = 20;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on search
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch participants
  const fetchParticipants = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getEventParticipants(id, {
        page, limit, search: debouncedSearch, sortBy, sortOrder,
      });
      setEventInfo(data.event);
      setParticipants(data.participants || []);
      setPagination(data.pagination || {});
    } catch (error) {
      console.error('Error fetching participants:', error);
      if (error.message?.includes('Not authorized')) {
        showToast('error', 'You are not authorized to view this data.');
        setTimeout(() => navigate('/profile'), 2000);
      } else {
        showToast('error', error.message || 'Failed to load participants');
      }
    } finally {
      setLoading(false);
    }
  }, [id, page, limit, debouncedSearch, sortBy, sortOrder, navigate]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchParticipants();
  }, [fetchParticipants, user, navigate]);

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast({ type: '', text: '' }), 4000);
  };

  const handleDownloadPDF = async () => {
    setDownloadingPDF(true);
    try {
      await downloadParticipantPDF(id);
      showToast('success', 'PDF downloaded successfully!');
    } catch (error) {
      showToast('error', error.message || 'Failed to download PDF');
    } finally {
      setDownloadingPDF(false);
    }
  };

  const handleDownloadCSV = async () => {
    setDownloadingCSV(true);
    try {
      await downloadParticipantCSV(id);
      showToast('success', 'CSV downloaded successfully!');
    } catch (error) {
      showToast('error', error.message || 'Failed to download CSV');
    } finally {
      setDownloadingCSV(false);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const formatDate = (d) => {
    if (!d) return 'N/A';
    return new Date(d).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return <span className="ml-1 text-slate-300 dark:text-slate-600">↕</span>;
    return <span className="ml-1 text-indigo-500">{sortOrder === 'asc' ? '↑' : '↓'}</span>;
  };

  // ── Loading state ──────────────────────────────────────────────
  if (loading && !eventInfo) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900/50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  const startIdx = ((pagination.page || 1) - 1) * limit + 1;
  const endIdx = Math.min(startIdx + participants.length - 1, pagination.total || 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900/50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Toast */}
        {toast.text && (
          <div className={`fixed top-20 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold animate-in slide-in-from-right duration-300 ${
            toast.type === 'error'
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}>
            {toast.text}
          </div>
        )}

        {/* Back link */}
        <Link to="/profile" className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to My Events
        </Link>

        {/* Event Info Header */}
        {eventInfo && (
          <div className="bg-indigo-950 text-white rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-lg shadow-indigo-950/25">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <Badge variant={eventInfo.status === 'approved' ? 'success' : eventInfo.status === 'rejected' ? 'danger' : 'warning'}>
                  {eventInfo.status?.toUpperCase()}
                </Badge>
                <Badge variant="primary">{eventInfo.type}</Badge>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold mb-2">{eventInfo.title}</h1>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-indigo-200">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  {eventInfo.college}
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  {formatDate(eventInfo.date)}
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {eventInfo.totalRegistrations} Participants
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, email, or college..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-slate-100 placeholder-slate-400"
            />
          </div>

          {/* Download buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleDownloadPDF}
              disabled={downloadingPDF}
              className="inline-flex items-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloadingPDF ? (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              )}
              PDF
            </button>
            <button
              onClick={handleDownloadCSV}
              disabled={downloadingCSV}
              className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloadingCSV ? (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              )}
              CSV
            </button>
          </div>
        </div>

        {/* Participant Table */}
        <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-14">#</th>
                  <th className="px-4 py-3.5 text-left">
                    <button onClick={() => handleSort('name')} className="flex items-center text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-indigo-600 transition-colors">
                      Name <SortIcon field="name" />
                    </button>
                  </th>
                  <th className="px-4 py-3.5 text-left">
                    <button onClick={() => handleSort('email')} className="flex items-center text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-indigo-600 transition-colors">
                      Email <SortIcon field="email" />
                    </button>
                  </th>
                  <th className="px-4 py-3.5 text-left">
                    <button onClick={() => handleSort('college')} className="flex items-center text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-indigo-600 transition-colors">
                      College <SortIcon field="college" />
                    </button>
                  </th>
                  <th className="px-4 py-3.5 text-center">
                    <button onClick={() => handleSort('institutionType')} className="flex items-center text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-indigo-600 transition-colors">
                      Type <SortIcon field="institutionType" />
                    </button>
                  </th>
                  <th className="px-4 py-3.5 text-left">
                    <button onClick={() => handleSort('createdAt')} className="flex items-center text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-indigo-600 transition-colors">
                      Registered <SortIcon field="createdAt" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {loading ? (
                  // Skeleton rows
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3.5"><Skeleton className="h-4 w-6" /></td>
                      <td className="px-4 py-3.5"><Skeleton className="h-4 w-32" /></td>
                      <td className="px-4 py-3.5"><Skeleton className="h-4 w-40" /></td>
                      <td className="px-4 py-3.5"><Skeleton className="h-4 w-28" /></td>
                      <td className="px-4 py-3.5"><Skeleton className="h-4 w-12 mx-auto" /></td>
                      <td className="px-4 py-3.5"><Skeleton className="h-4 w-24" /></td>
                    </tr>
                  ))
                ) : participants.length > 0 ? (
                  participants.map((p, index) => (
                    <tr key={p._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-4 py-3.5 text-slate-400 font-mono text-xs">{startIdx + index}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {p.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <span className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[180px]">{p.name || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400 truncate max-w-[200px]">{p.email || 'N/A'}</td>
                      <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400 truncate max-w-[180px]">{p.college || 'N/A'}</td>
                      <td className="px-4 py-3.5 text-center">
                        <Badge variant="primary">{p.institutionType || 'N/A'}</Badge>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 text-xs">{formatDate(p.createdAt)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-5xl mb-4">📋</span>
                        <p className="text-slate-500 dark:text-slate-400 font-medium mb-1">
                          {debouncedSearch ? 'No participants match your search' : 'No participants registered yet'}
                        </p>
                        <p className="text-slate-400 dark:text-slate-500 text-xs">
                          {debouncedSearch ? 'Try a different search term' : 'Share your event to get registrations'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.total > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
              <span className="text-xs text-slate-500">
                Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{startIdx}–{endIdx}</span> of <span className="font-semibold text-slate-700 dark:text-slate-300">{pagination.total}</span> participants
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  disabled={!pagination.hasPrevPage}
                  className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>
                <span className="flex items-center px-3 text-xs font-semibold text-slate-500">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage(prev => prev + 1)}
                  disabled={!pagination.hasNextPage}
                  className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </Card>

      </div>
    </div>
  );
};

export default ParticipantManager;
