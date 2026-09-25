import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getBackendHealth } from '../services/api';
import MainLayout from '../layouts/MainLayout';

const Dashboard = () => {
  const { user } = useAuth();
  const [backendHealth, setBackendHealth] = useState(null);
  const [healthError, setHealthError] = useState(null);
  const [isHealthLoading, setIsHealthLoading] = useState(true);
  const [activeNotice, setActiveNotice] = useState(null);

  useEffect(() => {
    const fetchHealth = async () => {
      setIsHealthLoading(true);
      setHealthError(null);
      try {
        const data = await getBackendHealth();
        setBackendHealth(data);
      } catch (err) {
        setHealthError(err.message || 'Unable to reach backend API server.');
      } finally {
        setIsHealthLoading(false);
      }
    };

    fetchHealth();
  }, []);

  const displayName = user?.user_metadata?.full_name || user?.email || 'Valued Citizen';

  const handlePlaceholderClick = (featureName) => {
    setActiveNotice(`${featureName} will be available in Phase 3/4.`);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header Hero Section */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="inline-block px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 rounded-md mb-2 border border-emerald-100">
                SwasthyaSetu Citizen Portal
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Welcome to SwasthyaSetu
              </h1>
              <p className="text-sm sm:text-base text-slate-600 mt-1">
                Government Health Insurance Scheme Discovery Platform
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-right text-xs">
              <span className="text-slate-500 block">Logged in User</span>
              <strong className="text-slate-900 text-sm font-semibold">{displayName}</strong>
              <span className="text-slate-500 block text-[11px] truncate max-w-[200px]">{user?.email}</span>
            </div>
          </div>
        </div>

        {/* Backend Connectivity Status Widget */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center justify-between">
            <span>FastAPI Backend Health Status</span>
            <button
              onClick={() => {
                setIsHealthLoading(true);
                getBackendHealth()
                  .then((d) => { setBackendHealth(d); setHealthError(null); })
                  .catch((e) => setHealthError(e.message))
                  .finally(() => setIsHealthLoading(false));
              }}
              className="text-xs font-medium text-emerald-600 hover:text-emerald-700 underline"
            >
              Refresh Status
            </button>
          </h2>

          {isHealthLoading ? (
            <div className="flex items-center space-x-2 text-sm text-slate-500">
              <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Connecting to FastAPI backend (GET /health)...</span>
            </div>
          ) : healthError ? (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center space-x-2">
              <span className="w-2.5 h-2.5 bg-rose-500 rounded-full"></span>
              <span>Backend Offline / Unreachable: {healthError}</span>
            </div>
          ) : (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="font-semibold">Backend Operational:</span>
                <span>Service: <code className="bg-emerald-100 px-1 py-0.5 rounded">{backendHealth?.service}</code></span>
              </div>
              <span className="font-mono bg-emerald-200 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                STATUS: {backendHealth?.status?.toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Placeholder Toast / Notification */}
        {activeNotice && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-sm flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{activeNotice}</span>
            </div>
            <button
              onClick={() => setActiveNotice(null)}
              className="text-blue-600 hover:text-blue-800 font-bold text-xs"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Find Health Schemes (Phase 2 Active) */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center font-bold mb-4">
                📋
              </div>
              <h3 className="text-base font-bold text-slate-900">Find Health Schemes</h3>
              <p className="text-xs text-slate-500 mt-1">
                Browse 130+ verified central and state government health schemes and eligibility criteria.
              </p>
            </div>
            <Link
              to="/schemes"
              className="mt-6 w-full text-center py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-lg transition"
            >
              Explore Health Schemes →
            </Link>
          </div>

          {/* Card 2: Complete Profile */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center font-bold mb-4">
                👤
              </div>
              <h3 className="text-base font-bold text-slate-900">Complete Profile</h3>
              <p className="text-xs text-slate-500 mt-1">
                Add family, income, and location details to enhance scheme recommendations.
              </p>
            </div>
            <button
              onClick={() => handlePlaceholderClick('Complete Profile')}
              className="mt-6 w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg transition"
            >
              Complete Profile
            </button>
          </div>

          {/* Card 3: Ask AI Assistant */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-lg flex items-center justify-center font-bold mb-4">
                🤖
              </div>
              <h3 className="text-base font-bold text-slate-900">Ask AI Assistant</h3>
              <p className="text-xs text-slate-500 mt-1">
                Chat with our grounded AI assistant to resolve eligibility questions and document guidance.
              </p>
            </div>
            <button
              onClick={() => handlePlaceholderClick('Ask AI Assistant')}
              className="mt-6 w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg transition"
            >
              Ask AI Assistant
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
