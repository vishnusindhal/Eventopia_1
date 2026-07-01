import React, { useState, useEffect } from 'react';
import { approveEvent, rejectEvent } from '../services/eventService';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [pendingEvents, setPendingEvents] = useState([]);
  const [approvedEvents, setApprovedEvents] = useState([]);
  const [rejectedEvents, setRejectedEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!authLoading) {
      if (user?.role !== 'admin') {
        window.location.href = '/';
        return;
      }
      fetchAllEvents();
    }
  }, [user, authLoading]);

  const fetchAllEvents = async () => {
    setLoading(true);
    try {
      // Fetch events with different statuses
      const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
        api.get('/events?status=pending'),
        api.get('/events?status=approved'),
        api.get('/events?status=rejected')
      ]);

      setPendingEvents(pendingRes.data.events || []);
      setApprovedEvents(approvedRes.data.events || []);
      setRejectedEvents(rejectedRes.data.events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (eventId) => {
    try {
      await approveEvent(eventId);
      setMessage({ type: 'success', text: 'Event approved successfully!' });
      fetchAllEvents();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to approve event' });
    }
  };

  const handleReject = async (eventId) => {
    if (window.confirm('Are you sure you want to reject this event?')) {
      try {
        await rejectEvent(eventId);
        setMessage({ type: 'success', text: 'Event rejected' });
        fetchAllEvents();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } catch (error) {
        setMessage({ type: 'error', text: error.message || 'Failed to reject event' });
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const EventCard = ({ event, showActions = false }) => (
    <Card className="flex flex-col h-full border-t-4 border-t-slate-800 dark:border-t-slate-300">
      <div className="p-5 flex-grow">
        <div className="flex justify-between items-start mb-3">
          <Badge variant="primary" className="uppercase text-xs">{event.type}</Badge>
          <span className="text-xs font-semibold text-slate-500">{formatDate(event.date)}</span>
        </div>
        
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2 leading-tight">
          {event.title}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">
          {event.description}
        </p>
        
        <div className="space-y-2 text-sm bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">College:</span>
            <span className="text-slate-900 dark:text-slate-100 font-semibold text-right max-w-[60%] truncate">{event.college}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Inst. Type:</span>
            <span className="text-slate-900 dark:text-slate-100 font-semibold">{event.institutionType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Venue:</span>
            <span className="text-slate-900 dark:text-slate-100 font-semibold text-right max-w-[60%] truncate">{event.venue}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Organizer:</span>
            <span className="text-slate-900 dark:text-slate-100 font-semibold text-right max-w-[60%] truncate">{event.organizer}</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-2 mt-2">
            <span className="text-slate-500 font-medium">Submitter:</span>
            <span className="text-slate-900 dark:text-slate-100 font-semibold truncate">{event.createdBy?.name || 'Unknown'}</span>
          </div>
        </div>
      </div>

      {showActions && (
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex gap-3">
          <Button 
            className="flex-1 bg-success hover:bg-success/90 text-white"
            onClick={() => handleApprove(event._id)}
          >
            ✓ Approve
          </Button>
          <Button 
            variant="outline"
            className="flex-1 border-danger text-danger hover:bg-danger/10"
            onClick={() => handleReject(event._id)}
          >
            ✗ Reject
          </Button>
        </div>
      )}
    </Card>
  );

  if (loading || authLoading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-900 dark:border-white"></div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-300 max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="p-2 bg-slate-900 dark:bg-slate-100 rounded-lg text-white dark:text-slate-900 text-xl">🛡️</span>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Admin Dashboard</h1>
          </div>
          <p className="text-slate-500 font-medium ml-12">Manage and moderate platform events</p>
        </div>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-md flex items-center ${message.type === 'error' ? 'bg-danger/10 text-danger border border-danger/20' : 'bg-success/10 text-success border border-success/20'}`}>
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <Card className="p-5 flex flex-col justify-center border-l-4 border-l-warning">
          <span className="text-slate-500 font-medium text-sm mb-1 uppercase tracking-wider">Pending</span>
          <span className="text-3xl font-black text-slate-900 dark:text-slate-100">{pendingEvents.length}</span>
        </Card>
        <Card className="p-5 flex flex-col justify-center border-l-4 border-l-success">
          <span className="text-slate-500 font-medium text-sm mb-1 uppercase tracking-wider">Approved</span>
          <span className="text-3xl font-black text-slate-900 dark:text-slate-100">{approvedEvents.length}</span>
        </Card>
        <Card className="p-5 flex flex-col justify-center border-l-4 border-l-danger">
          <span className="text-slate-500 font-medium text-sm mb-1 uppercase tracking-wider">Rejected</span>
          <span className="text-3xl font-black text-slate-900 dark:text-slate-100">{rejectedEvents.length}</span>
        </Card>
        <Card className="p-5 flex flex-col justify-center border-l-4 border-l-slate-800 dark:border-l-slate-400 bg-slate-50 dark:bg-slate-800/50">
          <span className="text-slate-500 font-medium text-sm mb-1 uppercase tracking-wider">Total</span>
          <span className="text-3xl font-black text-slate-900 dark:text-slate-100">
            {pendingEvents.length + approvedEvents.length + rejectedEvents.length}
          </span>
        </Card>
      </div>

      <div className="flex overflow-x-auto gap-2 mb-8 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          className={`px-4 py-2 font-medium text-sm whitespace-nowrap rounded-t-lg transition-colors flex items-center gap-2 ${activeTab === 'pending' ? 'text-slate-900 dark:text-white border-b-2 border-slate-900 dark:border-white bg-slate-100 dark:bg-slate-800' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
          onClick={() => setActiveTab('pending')}
        >
          <span className="w-2 h-2 rounded-full bg-warning"></span>
          Pending Approval
          <span className="ml-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 py-0.5 px-2 rounded-full text-xs">{pendingEvents.length}</span>
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm whitespace-nowrap rounded-t-lg transition-colors flex items-center gap-2 ${activeTab === 'approved' ? 'text-slate-900 dark:text-white border-b-2 border-slate-900 dark:border-white bg-slate-100 dark:bg-slate-800' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
          onClick={() => setActiveTab('approved')}
        >
          <span className="w-2 h-2 rounded-full bg-success"></span>
          Approved
          <span className="ml-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 py-0.5 px-2 rounded-full text-xs">{approvedEvents.length}</span>
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm whitespace-nowrap rounded-t-lg transition-colors flex items-center gap-2 ${activeTab === 'rejected' ? 'text-slate-900 dark:text-white border-b-2 border-slate-900 dark:border-white bg-slate-100 dark:bg-slate-800' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
          onClick={() => setActiveTab('rejected')}
        >
          <span className="w-2 h-2 rounded-full bg-danger"></span>
          Rejected
          <span className="ml-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 py-0.5 px-2 rounded-full text-xs">{rejectedEvents.length}</span>
        </button>
      </div>

      <div className="min-h-[400px]">
        {activeTab === 'pending' && (
          <div className="animate-in fade-in duration-300">
            {pendingEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {pendingEvents.map(event => (
                  <EventCard key={event._id} event={event} showActions={true} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-surface dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-xl">
                <div className="text-5xl mb-4 opacity-50">🎉</div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">All caught up!</h3>
                <p className="text-slate-500">There are no pending events to review.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'approved' && (
          <div className="animate-in fade-in duration-300">
            {approvedEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {approvedEvents.map(event => (
                  <EventCard key={event._id} event={event} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-surface dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-xl">
                <p className="text-slate-500">No approved events yet.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'rejected' && (
          <div className="animate-in fade-in duration-300">
            {rejectedEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {rejectedEvents.map(event => (
                  <EventCard key={event._id} event={event} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-surface dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-xl">
                <p className="text-slate-500">No rejected events.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;