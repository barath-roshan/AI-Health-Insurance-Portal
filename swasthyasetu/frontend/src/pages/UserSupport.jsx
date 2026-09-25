import React, { useState, useEffect } from 'react';
import { getSupportRequests } from '../services/api';
import MainLayout from '../layouts/MainLayout';

const STATUS_BADGES = {
  PENDING: 'bg-amber-50 text-amber-800 border-amber-200',
  IN_PROGRESS: 'bg-blue-50 text-blue-800 border-blue-200',
  RESOLVED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  CLOSED: 'bg-slate-100 text-slate-700 border-slate-200'
};

const UserSupport = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getSupportRequests();
        setRequests(data);
      } catch (err) {
        setError(err.message || 'Failed to load support requests.');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Hero */}
        <div className="bg-slate-900 text-white rounded-xl p-6 sm:p-8 shadow-sm">
          <span className="inline-block px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-slate-800 rounded mb-2 border border-slate-700">
            Citizen Assistance Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            My Human Assistance Requests
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Track the status of your customer care handoff tickets and dispute cases.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-500 text-sm font-medium">Loading support requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-2">
            <p className="text-slate-700 font-bold">No Active Support Requests</p>
            <p className="text-slate-500 text-xs">
              When an issue requires specialized human assistance during AI chat, your ticket will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => {
              const badgeClass = STATUS_BADGES[req.status] || STATUS_BADGES.PENDING;

              return (
                <div
                  key={req.id}
                  className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition space-y-3"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[11px] font-mono text-slate-400 block">
                        TICKET ID: {req.id}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {req.intent ? `Assistance for ${req.intent}` : 'Customer Support Request'}
                      </h3>
                    </div>

                    <span className={`px-3 py-1 text-xs font-bold rounded-full border ${badgeClass}`}>
                      STATUS: {req.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">
                    <strong>Reason:</strong> {req.reason || 'Case-specific evaluation required.'}
                  </p>

                  {req.summary && (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
                      <strong>Summary:</strong> {req.summary}
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Created: {new Date(req.created_at).toLocaleString()}</span>
                    <span>Updated: {new Date(req.updated_at || req.created_at).toLocaleString()}</span>
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

export default UserSupport;
