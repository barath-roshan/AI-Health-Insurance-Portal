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
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { 
  Settings, 
  RefreshCw, 
  Activity, 
  FileText, 
  Headphones, 
  Server, 
  CheckCircle2,
  AlertCircle,
  Edit2,
  Check
} from 'lucide-react';

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
      setSuccessMsg(`Handoff ticket status updated to ${nextStatus}`);
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
        
        {/* HEADER HERO */}
        <div className="bg-[#0B2545] text-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-1.5 bg-rose-950/80 border border-rose-500/30 px-3 py-1 rounded-full text-xs font-semibold text-rose-300">
              <Settings className="w-3.5 h-3.5 text-rose-300" />
              <span>Admin Operations Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              KAAPAN System Governance
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Role Authorization Enforced • Support Handoffs • Scheme Version Audit • Cache Management
            </p>
          </div>

          <Button variant="outline" size="sm" onClick={loadAdminData} icon={RefreshCw} className="!bg-slate-900 !text-white !border-slate-700">
            Refresh Data
          </Button>
        </div>

        {/* Global Alerts */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm rounded-xl flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="font-bold text-xs">✕</button>
          </div>
        )}

        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm rounded-xl flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg(null)} className="font-bold text-xs">✕</button>
          </div>
        )}

        {/* ADMIN NAVIGATION TABS */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200/90 pb-3">
          {[
            { key: 'overview', label: 'System Overview', icon: Activity },
            { key: 'support', label: `Support Handoffs (${counts.pendingHandoffs})`, icon: Headphones },
            { key: 'schemes', label: `Schemes & Versioning (${counts.activeSchemes})`, icon: FileText },
            { key: 'system', label: 'Services & Infrastructure', icon: Server }
          ].map((tab) => {
            const isActive = activeTab === tab.key;
            const TabIcon = tab.icon;

            return (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setEditingScheme(null); }}
                className={`px-4 py-2.5 text-xs font-bold rounded-xl transition flex items-center space-x-2 border cursor-pointer ${
                  isActive
                    ? 'bg-[#0F4C5C] text-white border-[#0F4C5C] shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <TabIcon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="py-16 text-center space-y-3 max-w-md mx-auto">
            <div className="w-10 h-10 border-4 border-[#0F4C5C] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-500 text-sm font-medium">Authorizing role & loading operations state...</p>
          </div>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <Card hoverEffect className="space-y-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Pending Support Handoffs</span>
                    <div className="text-3xl font-extrabold text-amber-600 font-mono">{counts.pendingHandoffs}</div>
                    <span className="text-[11px] text-slate-400 block">Requires human review</span>
                  </Card>

                  <Card hoverEffect className="space-y-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Active Health Schemes</span>
                    <div className="text-3xl font-extrabold text-emerald-600 font-mono">{counts.activeSchemes}</div>
                    <span className="text-[11px] text-slate-400 block">PostgreSQL scheme catalog</span>
                  </Card>

                  <Card hoverEffect className="space-y-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Needs Audit Verification</span>
                    <div className="text-3xl font-extrabold text-indigo-600 font-mono">{counts.needsVerification}</div>
                    <span className="text-[11px] text-slate-400 block">Verification queue</span>
                  </Card>

                  <Card hoverEffect className="space-y-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">RAG Reindex Stale</span>
                    <div className="text-3xl font-extrabold text-rose-600 font-mono">{counts.staleRag}</div>
                    <span className="text-[11px] text-slate-400 block">Marked for vector reindex</span>
                  </Card>
                </div>
              </div>
            )}

            {/* SUPPORT HANDOFFS TAB */}
            {activeTab === 'support' && (
              <Card className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h2 className="text-base font-bold text-slate-900">
                    Human Support Handoff Tickets
                  </h2>
                  <Badge variant="neutral" size="sm" className="font-mono">
                    {handoffs.length} Total Requests
                  </Badge>
                </div>

                <div className="space-y-3">
                  {handoffs.map((h) => (
                    <div key={h.id} className="p-4 border border-slate-200/80 rounded-xl space-y-3 bg-slate-50/60">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div>
                          <span className="text-[11px] font-mono text-slate-400 block">TICKET ID: {h.id}</span>
                          <h4 className="text-sm font-bold text-slate-900">
                            Query: "{h.user_query}"
                          </h4>
                        </div>
                        <Badge variant="neutral" size="sm">
                          {h.status}
                        </Badge>
                      </div>

                      <p className="text-xs text-slate-700">
                        <strong className="text-slate-900 font-semibold">Reason:</strong> {h.reason || 'N/A'}
                      </p>

                      <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-slate-500 mr-2">Update Status:</span>

                        {h.status === 'PENDING' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleStatusTransition(h.id, 'IN_PROGRESS')}
                          >
                            Mark IN_PROGRESS →
                          </Button>
                        )}

                        {h.status === 'IN_PROGRESS' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleStatusTransition(h.id, 'RESOLVED')}
                          >
                            Mark RESOLVED →
                          </Button>
                        )}

                        {h.status === 'RESOLVED' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusTransition(h.id, 'CLOSED')}
                          >
                            Mark CLOSED →
                          </Button>
                        )}

                        {h.status === 'CLOSED' && (
                          <span className="text-xs text-slate-400 italic">Ticket fully resolved & closed</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* SCHEMES MANAGEMENT TAB */}
            {activeTab === 'schemes' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Catalog List */}
                <div className="lg:col-span-6 space-y-3">
                  <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider px-1">
                    Scheme Catalog Directory
                  </h2>

                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                    {schemes.map((s) => (
                      <Card
                        key={s.id}
                        onClick={() => handleEditSchemeClick(s)}
                        className={`cursor-pointer transition-all ${
                          editingScheme?.id === s.id
                            ? 'border-[#0F4C5C] bg-teal-50/50 shadow-xs'
                            : 'hover:border-slate-300'
                        }`}
                        padding="compact"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                            {s.scheme_name}
                          </h4>
                          <Badge variant="brand" size="sm">
                            v{s.current_version}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{s.description}</p>
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          <span className="font-mono text-slate-400">Code: {s.scheme_code}</span>
                          {s.rag_stale && (
                            <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                              RAG Reindex Required
                            </span>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Edit Form */}
                <div className="lg:col-span-6">
                  <Card className="space-y-4">
                    <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
                      <span>{editingScheme ? `Edit Metadata: ${editingScheme.scheme_name}` : 'Select a Scheme to Edit'}</span>
                      {editingScheme && <Edit2 className="w-4 h-4 text-[#0F4C5C]" />}
                    </h2>

                    {editingScheme ? (
                      <form onSubmit={handleSaveScheme} className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                            Scheme Title
                          </label>
                          <input
                            type="text"
                            required
                            value={schemeForm.scheme_name}
                            onChange={(e) => setSchemeForm({ ...schemeForm, scheme_name: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                              Category
                            </label>
                            <input
                              type="text"
                              value={schemeForm.category}
                              onChange={(e) => setSchemeForm({ ...schemeForm, category: e.target.value })}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                              State / Region
                            </label>
                            <input
                              type="text"
                              value={schemeForm.state_or_region}
                              onChange={(e) => setSchemeForm({ ...schemeForm, state_or_region: e.target.value })}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                            Verification Status
                          </label>
                          <select
                            value={schemeForm.verification_status}
                            onChange={(e) => setSchemeForm({ ...schemeForm, verification_status: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900"
                          >
                            <option value="verified">Verified</option>
                            <option value="needs_verification">Needs Verification</option>
                            <option value="draft">Draft</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                            Description
                          </label>
                          <textarea
                            rows={3}
                            value={schemeForm.description}
                            onChange={(e) => setSchemeForm({ ...schemeForm, description: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900"
                          />
                        </div>

                        <Button type="submit" variant="primary" size="md" className="w-full" icon={Check}>
                          Save & Create New Version
                        </Button>

                        <div className="pt-4 border-t border-slate-100 space-y-2">
                          <span className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                            Version History Audit ({selectedSchemeVersions.length})
                          </span>
                          <div className="space-y-1.5 max-h-36 overflow-y-auto text-xs">
                            {selectedSchemeVersions.map((v) => (
                              <div key={v.id} className="p-2 bg-slate-50 rounded-lg border border-slate-200 flex justify-between">
                                <span className="font-mono">Version #{v.version}</span>
                                <span className="text-slate-400">{new Date(v.effective_from).toLocaleDateString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </form>
                    ) : (
                      <p className="text-slate-400 text-xs py-12 text-center">
                        Select any scheme from the list on the left to edit metadata and inspect version history.
                      </p>
                    )}
                  </Card>
                </div>

              </div>
            )}

            {/* SERVICES & SYSTEM TAB */}
            {activeTab === 'system' && systemStatus && (
              <Card className="space-y-6">
                <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center space-x-2">
                  <Server className="w-4 h-4 text-[#0F4C5C]" />
                  <span>Live Infrastructure Operational Health</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 border border-slate-200/80 rounded-xl space-y-2 bg-slate-50/80">
                    <span className="font-bold text-slate-700 uppercase tracking-wider">FastAPI Backend</span>
                    <div className="text-emerald-700 font-mono font-bold">STATUS: {systemStatus.kaapan_backend?.status?.toUpperCase()}</div>
                    <span className="text-slate-500 block">Service: {systemStatus.kaapan_backend?.service}</span>
                  </div>

                  <div className="p-4 border border-slate-200/80 rounded-xl space-y-2 bg-slate-50/80">
                    <span className="font-bold text-slate-700 uppercase tracking-wider">PostgreSQL Database</span>
                    <div className="text-emerald-700 font-mono font-bold">STATUS: {systemStatus.postgresql?.status?.toUpperCase()}</div>
                    <span className="text-slate-500 block">Driver: SQLAlchemy / psycopg2</span>
                  </div>

                  <div className="p-4 border border-slate-200/80 rounded-xl space-y-2 bg-slate-50/80">
                    <span className="font-bold text-slate-700 uppercase tracking-wider">Redis Cache (Port 6379)</span>
                    <div className="text-emerald-700 font-mono font-bold">STATUS: {systemStatus.redis_cache?.status?.toUpperCase()}</div>
                    <span className="text-slate-500 block">Host: {systemStatus.redis_cache?.host}:{systemStatus.redis_cache?.port}</span>
                  </div>

                  <div className="p-4 border border-slate-200/80 rounded-xl space-y-2 bg-slate-50/80">
                    <span className="font-bold text-slate-700 uppercase tracking-wider">Node.js RAG Microservice (Port 5000)</span>
                    <div className="text-emerald-700 font-mono font-bold">STATUS: {systemStatus.rag_microservice?.status?.toUpperCase()}</div>
                    <span className="text-slate-500 block">Service: {systemStatus.rag_microservice?.service}</span>
                  </div>
                </div>
              </Card>
            )}
          </>
        )}

      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
