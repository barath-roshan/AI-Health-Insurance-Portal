import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { checkEligibility, getProfile } from '../services/api';
import MainLayout from '../layouts/MainLayout';

const STATUS_BADGES = {
  ELIGIBLE: {
    label: 'ELIGIBLE',
    bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    dot: 'bg-emerald-500',
    tab: 'border-emerald-600 text-emerald-700 bg-emerald-50'
  },
  NEAR_MATCH: {
    label: 'NEAR MATCH',
    bg: 'bg-amber-50 text-amber-800 border-amber-200',
    dot: 'bg-amber-500',
    tab: 'border-amber-600 text-amber-700 bg-amber-50'
  },
  NEEDS_INFORMATION: {
    label: 'NEEDS INFORMATION',
    bg: 'bg-blue-50 text-blue-800 border-blue-200',
    dot: 'bg-blue-500',
    tab: 'border-blue-600 text-blue-700 bg-blue-50'
  },
  NOT_ELIGIBLE: {
    label: 'NOT ELIGIBLE',
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
    tab: 'border-slate-600 text-slate-700 bg-slate-100'
  }
};

const EligibilityResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('ALL');
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const profile = await getProfile();
        setUserProfile(profile);

        const data = await checkEligibility({ profile_id: profile.id });
        setResults(data.results || []);
      } catch (err) {
        setError(err.message || 'Failed to calculate scheme eligibility.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  const counts = {
    ALL: results.length,
    ELIGIBLE: results.filter((r) => r.status === 'ELIGIBLE').length,
    NEAR_MATCH: results.filter((r) => r.status === 'NEAR_MATCH').length,
    NEEDS_INFORMATION: results.filter((r) => r.status === 'NEEDS_INFORMATION').length,
    NOT_ELIGIBLE: results.filter((r) => r.status === 'NOT_ELIGIBLE').length
  };

  const filteredResults = activeTab === 'ALL'
    ? results
    : results.filter((r) => r.status === activeTab);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header Hero Section */}
        <div className="bg-slate-900 text-white rounded-xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="inline-block px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-slate-800 rounded mb-2 border border-slate-700">
              Deterministic Rules Engine
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Scheme Eligibility Results
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Calculated using verified government rules based on your demographic profile.
            </p>
          </div>

          <Link
            to="/profile"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg transition"
          >
            ✏️ Edit Profile Data
          </Link>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
          {[
            { key: 'ALL', label: 'All Schemes' },
            { key: 'ELIGIBLE', label: 'Eligible' },
            { key: 'NEAR_MATCH', label: 'Near Match' },
            { key: 'NEEDS_INFORMATION', label: 'Needs Info' },
            { key: 'NOT_ELIGIBLE', label: 'Not Eligible' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition border ${
                activeTab === tab.key
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}{' '}
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-800 font-mono">
                {counts[tab.key] || 0}
              </span>
            </button>
          ))}
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl">
            {error}
          </div>
        )}

        {/* Results List */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-500 text-sm font-medium">Evaluating scheme eligibility rules...</p>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
            <p className="text-slate-600 font-medium">No schemes found in this category.</p>
            <p className="text-slate-400 text-xs mt-1">Try selecting another status tab or update your profile details.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredResults.map((result) => {
              const badge = STATUS_BADGES[result.status] || STATUS_BADGES.NOT_ELIGIBLE;

              return (
                <div
                  key={result.scheme_id}
                  className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition space-y-4"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {result.category || 'Central'}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Region: <strong>{result.state_or_region || 'All India'}</strong>
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 leading-snug">
                        {result.scheme_name}
                      </h3>
                    </div>

                    <div className={`px-3 py-1 text-xs font-bold rounded-full border flex items-center space-x-2 ${badge.bg}`}>
                      <span className={`w-2 h-2 rounded-full ${badge.dot}`}></span>
                      <span>{badge.label}</span>
                    </div>
                  </div>

                  {/* Bullet Explanations */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      Rule Evaluation Breakdown:
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-800">
                      {result.explanation?.map((exp, i) => (
                        <li key={i} className="font-mono leading-relaxed">
                          {exp}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Link */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-slate-400 font-mono">
                      Scheme Code: {result.scheme_code}
                    </span>
                    <Link
                      to={`/schemes/${result.scheme_id}`}
                      className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition"
                    >
                      View Scheme Details →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default EligibilityResults;
