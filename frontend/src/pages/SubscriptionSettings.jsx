import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getSubscriptions, updateSubscriptions } from '../services/subscriptionService';
import { ALL_COLLEGES, INSTITUTION_TYPES, EVENT_CATEGORIES } from '../config/colleges';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const SubscriptionSettings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [institutes, setInstitutes] = useState([]);
  const [institutionTypes, setInstitutionTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subscribeAll, setSubscribeAll] = useState(false);

  // College search
  const [collegeSearch, setCollegeSearch] = useState('');
  const [showCollegeDropdown, setShowCollegeDropdown] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchSubscriptions();
  }, [user, navigate]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const res = await getSubscriptions();
      const subs = res.subscriptions || {};
      setInstitutes(subs.institutes || []);
      setInstitutionTypes(subs.institutionTypes || []);
      setCategories(subs.categories || []);
      setSubscribeAll(subs.subscribeAllInstitutes || false);
    } catch (err) {
      setError('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      await updateSubscriptions({
        institutes,
        institutionTypes,
        categories,
        subscribeAllInstitutes: subscribeAll
      });
      setSuccess('Subscriptions saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save subscriptions');
    } finally {
      setSaving(false);
    }
  };

  const toggleInstitute = (college) => {
    setInstitutes(prev =>
      prev.includes(college) ? prev.filter(c => c !== college) : [...prev, college]
    );
  };

  const removeInstitute = (college) => {
    setInstitutes(prev => prev.filter(c => c !== college));
  };

  const toggleInstitutionType = (type) => {
    setInstitutionTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const toggleCategory = (cat) => {
    setCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const filteredColleges = ALL_COLLEGES.filter(c =>
    c.toLowerCase().includes(collegeSearch.toLowerCase()) && !institutes.includes(c)
  );

  if (loading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
          <p className="text-slate-500 font-medium">Loading subscriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <span className="text-4xl">📡</span> Following Settings
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Choose which institutes and event categories you want to follow.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="whitespace-nowrap">
          {saving ? 'Saving...' : '💾 Save Changes'}
        </Button>
      </div>

      {success && (
        <div className="mb-6 p-4 rounded-md bg-success/10 border border-success/20 flex items-center text-success font-medium animate-in slide-in-from-top-2">
          <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {success}
        </div>
      )}
      
      {error && (
        <div className="mb-6 p-4 rounded-md bg-danger/10 border border-danger/20 flex items-center text-danger font-medium animate-in slide-in-from-top-2">
          <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {error}
        </div>
      )}

      {/* Subscribe All Toggle */}
      <Card className="mb-8 border-t-4 border-t-primary overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>🌍</span> Follow All Institutes
              </h2>
              <p className="text-slate-500 text-sm mt-1">Receive notifications from every institute on Eventopia</p>
            </div>
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className={`text-sm font-medium ${subscribeAll ? 'text-primary' : 'text-slate-500'}`}>
                {subscribeAll ? "You're following ALL institutes" : 'Follow all institutes'}
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={subscribeAll}
                  onChange={(e) => setSubscribeAll(e.target.checked)}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/30 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>
      </Card>

      {/* Institution Type Subscriptions */}
      {!subscribeAll && (
        <Card className="mb-8 overflow-hidden">
          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>🏛️</span> Institution Types
            </h2>
            <p className="text-slate-500 text-sm mt-1">Follow entire institution categories</p>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-3">
              {INSTITUTION_TYPES.map(({ value, label }) => {
                const isActive = institutionTypes.includes(value);
                return (
                  <button
                    key={value}
                    className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                      isActive 
                        ? 'bg-primary text-white border-primary shadow-sm shadow-primary/20 hover:bg-primary-dark' 
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                    onClick={() => toggleInstitutionType(value)}
                  >
                    {isActive && (
                      <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* Individual College Subscriptions */}
      {!subscribeAll && (
        <Card className="mb-8 overflow-hidden">
          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>🏫</span> Individual Institutes
            </h2>
            <p className="text-slate-500 text-sm mt-1">Follow specific colleges</p>
          </div>
          <div className="p-6 space-y-6">
            {/* Selected colleges */}
            {institutes.length > 0 && (
              <div className="flex flex-wrap gap-2 p-4 bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-slate-200 dark:border-slate-700">
                {institutes.map(college => (
                  <span key={college} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20">
                    {college}
                    <button 
                      className="ml-1.5 text-primary/70 hover:text-primary hover:bg-primary/20 rounded-full p-0.5 transition-colors focus:outline-none" 
                      onClick={() => removeInstitute(college)}
                      aria-label={`Remove ${college}`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Search & add */}
            <div className="relative">
              <Input
                type="text"
                placeholder="🔍 Search colleges to add..."
                value={collegeSearch}
                onChange={(e) => {
                  setCollegeSearch(e.target.value);
                  setShowCollegeDropdown(true);
                }}
                onFocus={() => setShowCollegeDropdown(true)}
                id="college-search"
                className="w-full pl-10"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              
              {showCollegeDropdown && collegeSearch && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 rounded-md shadow-lg border border-slate-200 dark:border-slate-700 max-h-60 overflow-auto animate-in fade-in slide-in-from-top-2">
                  {filteredColleges.length === 0 ? (
                    <div className="p-3 text-sm text-slate-500 text-center">No colleges found</div>
                  ) : (
                    <ul className="py-1">
                      {filteredColleges.slice(0, 10).map(college => (
                        <li key={college}>
                          <button
                            className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-primary dark:hover:text-primary-light transition-colors"
                            onClick={() => {
                              toggleInstitute(college);
                              setCollegeSearch('');
                              setShowCollegeDropdown(false);
                            }}
                          >
                            {college}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Category Subscriptions */}
      <Card className="mb-8 overflow-hidden">
        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>🏷️</span> Event Categories
          </h2>
          <p className="text-slate-500 text-sm mt-1">Only receive notifications for selected event types.</p>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-3">
            {EVENT_CATEGORIES.map(cat => {
              const isActive = categories.includes(cat);
              return (
                <button
                  key={cat}
                  className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                    isActive 
                      ? 'bg-secondary text-white border-secondary shadow-sm shadow-secondary/20 hover:bg-secondary-dark' 
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                  onClick={() => toggleCategory(cat)}
                >
                  {isActive && (
                    <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {cat}
                </button>
              );
            })}
          </div>
          {categories.length === 0 && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/50 inline-block">
              <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
                💡 <strong>Hint:</strong> No categories selected = you'll receive notifications for all categories.
              </p>
            </div>
          )}
        </div>
      </Card>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-800">
        <Button variant="outline" onClick={() => navigate('/settings/notifications')} className="w-full sm:w-auto">
          Notification Preferences →
        </Button>
        <Button onClick={handleSave} disabled={saving} size="lg" className="w-full sm:w-auto shadow-md">
          {saving ? 'Saving...' : '💾 Save Following'}
        </Button>
      </div>
    </div>
  );
};

export default SubscriptionSettings;
