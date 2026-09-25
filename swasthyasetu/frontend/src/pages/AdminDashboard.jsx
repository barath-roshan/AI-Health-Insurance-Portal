import React, { useState, useEffect } from 'react';
import {
  getAdminHandoffs,
  updateAdminHandoffStatus,
  getAdminSchemes,
  updateAdminScheme,
  getAdminSchemeVersions,
  getAdminSystemStatus
} from '../services/api';
import MainLayout from '../layouts/MainLayout';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [handoffs, setHandoffs] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [selectedSchemeVersions, setSelectedSchemeVersions] = useState([]);
  const [systemStatus, setSystemStatus] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Editing state
  const [editingScheme, setEditingScheme] = useState(null);
  const [schemeForm, setSchemeForm] = useState({
    scheme_name: '',
    category: '',
    state_or_region: '',
    description: '',
    verification_status: 'verified'
  });

  const loadAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [hData, sData, stData] = await Promise.all([
        getAdminHandoffs(),
        getAdminSchemes(),
        getAdminSystemStatus()
      ]);
      setHandoffs(hData);
      setSchemes(sData);
      setSystemStatus(stData);
    } catch (err) {
      setError(err.message || 'Failed to load admin portal data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleStatusTransition = async (handoffId, nextStatus) => {
    setError(null);
    setSuccessMsg(null);
    try {
      await updateAdminHandoffStatus(handoffId, nextStatus);
      setSuccessMsg(`Handoff status updated to ${nextStatus}`);
      loadAdminData();
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to update handoff status.');
    }
  };

  const handleEditSchemeClick = (scheme) => {
    setEditingScheme(scheme);
    setSchemeForm({
      scheme_name: scheme.scheme_name,
      category: scheme.category || '',
      state_or_region: scheme.state_or_region || '',
      description: scheme.description || '',
      verification_status: scheme.verification_status || 'verified'
    });
    // Load versions
    getAdminSchemeVersions(scheme.id)
      .then((vers) => setSelectedSchemeVersions(vers))
      .catch(() => setSelectedSchemeVersions([]));
  };

  const handleSaveScheme = async (e) => {
    e.preventDefault();
    if (!editingScheme) return;
    setError(null);
    setSuccessMsg(null);

    try {
      await updateAdminScheme(editingScheme.id, schemeForm);
      setSuccessMsg(`Scheme metadata updated. New version created and RAG marked as stale.`);
      setEditingScheme(null);
      loadAdminData();
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to update scheme.');
    }
  };

  const counts = {
    pendingHandoffs: handoffs.filter((h) => h.status === 'PENDING').length,
    activeSchemes: schemes.filter((s) => s.status === 'active').length,
    needsVerification: schemes.filter((s) => s.verification_status === 'needs_verification').length,
    staleRag: schemes.filter((s) => s.rag_stale).length
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header Hero */}
        <div className="bg-slate-900 text-white rounded-xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="inline-block px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-rose-400 bg-slate-800 rounded mb-2 border border-slate-700">
              Admin Governance Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              SwasthyaSetu System Administration
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              Backend Role Authorization Enforced • Support Handoffs • Scheme Versioning • Cache Invalidation
            </p>
          </div>

          <button
            onClick={loadAdminData}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg border border-slate-700 transition"
          >
            🔄 Refresh Status
          </button>
        </div>

        {/* Global Notifications */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="font-bold text-xs">✕</button>
          </div>
        )}

        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl flex justify-between items-center">
            <span>{successMsg}</span>
            <button onClick={() => setSuccessMsg(null)} className="font-bold text-xs">✕</button>
          </div>
        )}

        {/* Admin Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
          {[
            { key: 'overview', label: '📊 System Overview' },
            { key: 'support', label: `🎧 Support Handoffs (${counts.pendingHandoffs})` },
            { key: 'schemes', label: `📋 Schemes & Versions (${counts.activeSchemes})` },
            { key: 'system', label: '⚙️ Services & Redis Status' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setEditingScheme(null); }}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition border ${
                activeTab === tab.key
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-500 text-sm font-medium">Authorizing admin & loading system state...</p>
          </div>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <span className="text-xs font-bold text-slate-500 uppercase">Pending Support Handoffs</span>
                    <div className="text-3xl font-extrabold text-amber-600 mt-2">{counts.pendingHandoffs}</div>
                    <span className="text-[11px] text-slate-400 block mt-1">Requires admin review</span>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <span className="text-xs font-bold text-slate-500 uppercase">Active Schemes</span>
                    <div className="text-3xl font-extrabold text-emerald-600 mt-2">{counts.activeSchemes}</div>
                    <span className="text-[11px] text-slate-400 block mt-1">PostgreSQL database records</span>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <span className="text-xs font-bold text-slate-500 uppercase">Needs Verification</span>
                    <div className="text-3xl font-extrabold text-blue-600 mt-2">{counts.needsVerification}</div>
                    <span className="text-[11px] text-slate-400 block mt-1">Audit status</span>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <span className="text-xs font-bold text-slate-500 uppercase">RAG Reindex Stale</span>
                    <div className="text-3xl font-extrabold text-purple-600 mt-2">{counts.staleRag}</div>
                    <span className="text-[11px] text-slate-400 block mt-1">Marked for reindex</span>
                  </div>
                </div>
              </div>
            )}

            {/* SUPPORT HANDOFFS TAB */}
            {activeTab === 'support' && (
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
                <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex justify-between items-center">
                  <span>Human Support Handoff Requests</span>
                  <span className="text-xs font-normal text-slate-500">{handoffs.length} Total Tickets</span>
                </h2>

                <div className="space-y-4">
                  {handoffs.map((h) => (
                    <div key={h.id} className="p-4 border border-slate-200 rounded-lg space-y-3 bg-slate-50">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div>
                          <span className="text-[11px] font-mono text-slate-400 block">ID: {h.id}</span>
                          <h4 className="text-sm font-bold text-slate-900">
                            Query: "{h.user_query}"
                          </h4>
                        </div>
                        <span className="px-2.5 py-1 text-xs font-bold rounded bg-slate-900 text-white">
                          {h.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700">
                        <strong>Reason:</strong> {h.reason || 'N/A'}
                      </p>

                      {/* Status Transition Action Buttons */}
                      <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-slate-500 mr-2">Update Status:</span>

                        {h.status === 'PENDING' && (
                          <button
                            onClick={() => handleStatusTransition(h.id, 'IN_PROGRESS')}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded transition"
                          >
                            Mark IN_PROGRESS →
                          </button>
                        )}

                        {h.status === 'IN_PROGRESS' && (
                          <button
                            onClick={() => handleStatusTransition(h.id, 'RESOLVED')}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded transition"
                          >
                            Mark RESOLVED →
                          </button>
                        )}

                        {h.status === 'RESOLVED' && (
                          <button
                            onClick={() => handleStatusTransition(h.id, 'CLOSED')}
                            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded transition"
                          >
                            Mark CLOSED →
                          </button>
                        )}

                        {h.status === 'CLOSED' && (
                          <span className="text-xs text-slate-400 italic">Ticket fully resolved and closed</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SCHEMES MANAGEMENT & VERSIONING TAB */}
            {activeTab === 'schemes' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Schemes Catalog List */}
                <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
                  <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                    Scheme Management
                  </h2>

                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                    {schemes.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => handleEditSchemeClick(s)}
                        className={`p-4 border rounded-lg cursor-pointer transition ${
                          editingScheme?.id === s.id
                            ? 'border-emerald-600 bg-emerald-50'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-sm font-bold text-slate-900 leading-snug">
                            {s.scheme_name}
                          </h4>
                          <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-slate-100 text-slate-700 rounded">
                            v{s.current_version}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{s.description}</p>
                        <div className="mt-2 flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Code: {s.scheme_code}</span>
                          {s.rag_stale && (
                            <span className="text-purple-700 font-bold bg-purple-50 px-1.5 py-0.5 rounded">
                              RAG Reindex Required
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Edit Scheme Panel */}
                <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
                  <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                    {editingScheme ? `Edit: ${editingScheme.scheme_name}` : 'Select a Scheme to Edit'}
                  </h2>

                  {editingScheme ? (
                    <form onSubmit={handleSaveScheme} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                          Scheme Title
                        </label>
                        <input
                          type="text"
                          required
                          value={schemeForm.scheme_name}
                          onChange={(e) => setSchemeForm({ ...schemeForm, scheme_name: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded text-sm text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                          Category
                        </label>
                        <input
                          type="text"
                          value={schemeForm.category}
                          onChange={(e) => setSchemeForm({ ...schemeForm, category: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded text-sm text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                          State / Region
                        </label>
                        <input
                          type="text"
                          value={schemeForm.state_or_region}
                          onChange={(e) => setSchemeForm({ ...schemeForm, state_or_region: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded text-sm text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                          Verification Status
                        </label>
                        <select
                          value={schemeForm.verification_status}
                          onChange={(e) => setSchemeForm({ ...schemeForm, verification_status: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded text-sm text-slate-900"
                        >
                          <option value="verified">Verified</option>
                          <option value="needs_verification">Needs Verification</option>
                          <option value="draft">Draft</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                          Description
                        </label>
                        <textarea
                          rows={3}
                          value={schemeForm.description}
                          onChange={(e) => setSchemeForm({ ...schemeForm, description: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded text-sm text-slate-900"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded transition shadow-sm"
                      >
                        Save & Create New Version (Invalidates Redis Cache)
                      </button>

                      {/* Historical Version Audit List */}
                      <div className="pt-4 border-t border-slate-100 space-y-2">
                        <span className="text-xs font-bold text-slate-700 block">
                          Historical Version Records ({selectedSchemeVersions.length})
                        </span>
                        <div className="space-y-1.5 max-h-36 overflow-y-auto text-xs">
                          {selectedSchemeVersions.map((v) => (
                            <div key={v.id} className="p-2 bg-slate-50 rounded border border-slate-200 flex justify-between">
                              <span>Version #{v.version}</span>
                              <span className="text-slate-400">{new Date(v.effective_from).toLocaleDateString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </form>
                  ) : (
                    <p className="text-slate-400 text-xs py-10 text-center">
                      Click any scheme from the catalog list on the left to edit metadata and view version history.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* SYSTEM & REDIS STATUS TAB */}
            {activeTab === 'system' && systemStatus && (
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
                <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                  Live Infrastructure & Cache Status
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 border border-slate-200 rounded-lg space-y-2 bg-slate-50">
                    <span className="font-bold text-slate-700 uppercase">KAAPAN FastAPI Backend</span>
                    <div className="text-emerald-700 font-mono font-bold">STATUS: {systemStatus.kaapan_backend?.status?.toUpperCase()}</div>
                    <span className="text-slate-500 block">Service: {systemStatus.kaapan_backend?.service}</span>
                  </div>

                  <div className="p-4 border border-slate-200 rounded-lg space-y-2 bg-slate-50">
                    <span className="font-bold text-slate-700 uppercase">PostgreSQL Database</span>
                    <div className="text-emerald-700 font-mono font-bold">STATUS: {systemStatus.postgresql?.status?.toUpperCase()}</div>
                    <span className="text-slate-500 block">Driver: SQLAlchemy / psycopg2</span>
                  </div>

                  <div className="p-4 border border-slate-200 rounded-lg space-y-2 bg-slate-50">
                    <span className="font-bold text-slate-700 uppercase">Redis Cache (Port 6379)</span>
                    <div className="text-emerald-700 font-mono font-bold">STATUS: {systemStatus.redis_cache?.status?.toUpperCase()}</div>
                    <span className="text-slate-500 block">Host: {systemStatus.redis_cache?.host}:{systemStatus.redis_cache?.port}</span>
                  </div>

                  <div className="p-4 border border-slate-200 rounded-lg space-y-2 bg-slate-50">
                    <span className="font-bold text-slate-700 uppercase">Node.js RAG Microservice (Port 5000)</span>
                    <div className="text-emerald-700 font-mono font-bold">STATUS: {systemStatus.rag_microservice?.status?.toUpperCase()}</div>
                    <span className="text-slate-500 block">Service: {systemStatus.rag_microservice?.service}</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
