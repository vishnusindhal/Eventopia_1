import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEvent } from '../services/eventService';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { IIT_COLLEGES, NIT_COLLEGES, IIIT_COLLEGES, ALL_COLLEGES } from '../config/colleges';

const COLLEGE_MAP = {
  IIT: IIT_COLLEGES,
  NIT: NIT_COLLEGES,
  IIIT: IIIT_COLLEGES,
  Other: ALL_COLLEGES
};

const SubmitEvent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Technical',
    college: '',
    institutionType: 'IIIT',
    date: '',
    endDate: '',
    venue: '',
    organizer: '',
    contact: '',
    registrationLink: '',
    image: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Autocomplete state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const suggestionsRef = useRef(null);
  const collegeInputRef = useRef(null);

  // Get filtered suggestions based on institution type + what user typed
  const getFilteredSuggestions = () => {
    const colleges = COLLEGE_MAP[formData.institutionType] || ALL_COLLEGES;
    const query = formData.college.trim().toLowerCase();
    if (!query) return colleges;
    return colleges.filter(c => c.toLowerCase().includes(query));
  };

  const suggestions = getFilteredSuggestions();

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        suggestionsRef.current && !suggestionsRef.current.contains(e.target) &&
        collegeInputRef.current && !collegeInputRef.current.contains(e.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // When institution type changes, clear the college field
    if (name === 'institutionType') {
      setFormData(prev => ({
        ...prev,
        institutionType: value,
        college: ''
      }));
      setShowSuggestions(false);
    }
  };

  const handleCollegeChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, college: value }));
    setShowSuggestions(true);
    setHighlightedIndex(-1);
  };

  const handleSelectSuggestion = (collegeName) => {
    setFormData(prev => ({ ...prev, college: collegeName }));
    setShowSuggestions(false);
    setHighlightedIndex(-1);
  };

  const handleCollegeKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelectSuggestion(suggestions[highlightedIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && suggestionsRef.current) {
      const items = suggestionsRef.current.querySelectorAll('[data-suggestion]');
      if (items[highlightedIndex]) {
        items[highlightedIndex].scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    setError('');

    if (!user) {
      setLoading(false);
      alert('Please login to submit an event');
      navigate('/login');
      return;
    }

    try {
      const res = await createEvent(formData);
      setSubmitted(true);

      setTimeout(() => {
        navigate('/profile');
      }, 2000);

    } catch (err) {
      // prefer backend message when available
      const message = err?.response?.data?.message || err?.message || 'Failed to submit event. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 animate-in fade-in duration-300">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 sm:text-4xl">
          Submit an Event
        </h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
          Share your event with students across IIITs, NITs, and IITs
        </p>
      </div>

      <Card className="p-6 sm:p-8 shadow-lg border-t-4 border-t-primary">
        {submitted && (
          <div className="mb-6 p-4 rounded-md bg-success/10 border border-success/20 flex items-start">
            <svg className="w-5 h-5 text-success mr-3 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div className="text-success font-medium">
              Event submitted successfully! It will be reviewed and published soon.
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-md bg-danger/10 border border-danger/20 flex items-start">
            <svg className="w-5 h-5 text-danger mr-3 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="text-danger font-medium">
              {error}
            </div>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Event Title *
              </label>
              <Input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g., TechFest 2024"
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Event Type *
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full h-10 px-3 py-2 bg-surface dark:bg-surface-dark border border-slate-300 dark:border-slate-700 rounded-md text-sm shadow-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:text-slate-100"
              >
                <option value="Technical">Technical</option>
                <option value="Cultural">Cultural</option>
                <option value="Hackathon">Hackathon</option>
                <option value="Workshop">Workshop</option>
                <option value="Seminar">Seminar</option>
                <option value="Sports">Sports</option>
                <option value="Webinar">Webinar</option>
                <option value="Competition">Competition</option>
                <option value="Internship">Internship</option>
                <option value="Placement Drive">Placement Drive</option>
                <option value="Tech Fest">Tech Fest</option>
                <option value="Cultural Fest">Cultural Fest</option>
                <option value="Sports Event">Sports Event</option>
                <option value="Coding Contest">Coding Contest</option>
                <option value="Research Program">Research Program</option>
                <option value="Open Source Program">Open Source Program</option>
                <option value="Scholarship">Scholarship</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="institutionType" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Institution Type *
              </label>
              <select
                id="institutionType"
                name="institutionType"
                value={formData.institutionType}
                onChange={handleChange}
                required
                className="w-full h-10 px-3 py-2 bg-surface dark:bg-surface-dark border border-slate-300 dark:border-slate-700 rounded-md text-sm shadow-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:text-slate-100"
              >
                <option value="IIIT">IIIT</option>
                <option value="NIT">NIT</option>
                <option value="IIT">IIT</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* College Name with Autocomplete */}
            <div className="relative">
              <label htmlFor="college" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                College Name *
              </label>
              <div className="relative" ref={collegeInputRef}>
                <input
                  type="text"
                  id="college"
                  name="college"
                  value={formData.college}
                  onChange={handleCollegeChange}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyDown={handleCollegeKeyDown}
                  required
                  autoComplete="off"
                  placeholder={`e.g., ${formData.institutionType} Surat`}
                  className="w-full h-10 px-3 py-2 bg-surface dark:bg-surface-dark border border-slate-300 dark:border-slate-700 rounded-md text-sm shadow-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:text-slate-100"
                />
                {/* Search icon */}
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-56 overflow-y-auto"
                >
                  {suggestions.map((college, index) => {
                    const query = formData.college.trim().toLowerCase();
                    const matchStart = college.toLowerCase().indexOf(query);
                    let content;
                    if (query && matchStart >= 0) {
                      const before = college.slice(0, matchStart);
                      const match = college.slice(matchStart, matchStart + query.length);
                      const after = college.slice(matchStart + query.length);
                      content = (
                        <span>
                          {before}
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">{match}</span>
                          {after}
                        </span>
                      );
                    } else {
                      content = college;
                    }

                    return (
                      <button
                        key={college}
                        type="button"
                        data-suggestion
                        onClick={() => handleSelectSuggestion(college)}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer flex items-center gap-2
                          ${index === highlightedIndex
                            ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                          }
                          ${index === 0 ? 'rounded-t-xl' : ''}
                          ${index === suggestions.length - 1 ? 'rounded-b-xl' : ''}
                        `}
                      >
                        <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
                        </svg>
                        {content}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* No match message */}
              {showSuggestions && formData.college.trim() && suggestions.length === 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-4 text-center">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    No matching college found. You can type a custom name.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Event Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="5"
              placeholder="Describe your event in detail..."
              className="w-full px-3 py-2 bg-surface dark:bg-surface-dark border border-slate-300 dark:border-slate-700 rounded-md text-sm shadow-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:text-slate-100 resize-y min-h-[120px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Start Date *
              </label>
              <Input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                End Date
              </label>
              <Input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="venue" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Venue *
              </label>
              <Input
                type="text"
                id="venue"
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                required
                placeholder="e.g., Main Auditorium"
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="organizer" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Organizer *
              </label>
              <Input
                type="text"
                id="organizer"
                name="organizer"
                value={formData.organizer}
                onChange={handleChange}
                required
                placeholder="e.g., Technical Club"
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="contact" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Contact Email *
              </label>
              <Input
                type="email"
                id="contact"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                required
                placeholder="contact@example.com"
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="registrationLink" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Registration Link
              </label>
              <Input
                type="url"
                id="registrationLink"
                name="registrationLink"
                value={formData.registrationLink}
                onChange={handleChange}
                placeholder="https://example.com/register"
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Event Image URL
            </label>
            <Input
              type="url"
              id="image"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="w-full"
            />
          </div>

          <div className="pt-4">
            <Button type="submit" fullWidth disabled={loading || submitted} size="lg">
              {loading ? 'Submitting...' : 'Submit Event'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default SubmitEvent;