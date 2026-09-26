import React, { useState, useEffect } from 'react';
import { getSupportRequests } from '../services/api';
import MainLayout from '../layouts/MainLayout';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import { Headphones, LifeBuoy, Clock, FileText, CheckCircle2, UserCheck, AlertCircle, RefreshCw } from 'lucide-react';

const STATUS_VARIANT_MAP = {
  PENDING: 'warning',
  IN_PROGRESS: 'needs_info',
  RESOLVED: 'eligible',
  CLOSED: 'not_eligible'
};

const UserSupport = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* HEADER HERO */}
        <div className="bg-[#0B2545] text-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-800 space-y-3">
          <div className="inline-flex items-center space-x-1.5 bg-teal-950/80 border border-teal-500/30 px-3 py-1 rounded-full text-xs font-semibold text-teal-300">
            <Headphones className="w-3.5 h-3.5 text-teal-300" />
            <span>Citizen Assistance Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Human Support & Assistance Requests
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
            Track the status of your customer care handoff tickets and specialized dispute assistance requests.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm rounded-xl flex items-center justify-between">
            <span>{error}</span>
            <Button variant="ghost" size="sm" onClick={fetchRequests} icon={RefreshCw}>
              Retry
            </Button>
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center space-y-3 max-w-md mx-auto">
            <div className="w-10 h-10 border-4 border-[#0F4C5C] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-500 text-sm font-medium">Loading citizen assistance tickets...</p>
          </div>
        ) : requests.length === 0 ? (
          <EmptyState
            title="No Active Support Requests"
            description="When a scheme inquiry requires specialized human assistance during AI chat, your handoff ticket will appear here."
            icon={LifeBuoy}
          />
        ) : (
          <div className="space-y-4">
            <div className="text-xs text-slate-500 font-medium px-1">
              Active Support Tickets ({requests.length})
            </div>

            {requests.map((req) => {
              const badgeVariant = STATUS_VARIANT_MAP[req.status] || 'warning';

              return (
                <Card
                  key={req.id}
                  hoverEffect
                  className="space-y-4 border border-slate-200/90"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
                    <div className="space-y-1">
                      <span className="text-[11px] font-mono text-slate-400 block">
                        TICKET ID: {req.id}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {req.intent ? `Assistance for ${req.intent}` : 'Customer Support Handoff Request'}
                      </h3>
                    </div>

                    <Badge variant={badgeVariant} size="md" showDot>
                      STATUS: {req.status}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">
                    <strong className="text-slate-900 font-semibold">Handoff Reason:</strong> {req.reason || 'Case-specific evaluation required.'}
                  </p>

                  {req.summary && (
                    <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-600 leading-relaxed">
                      <strong className="text-slate-800 font-semibold block mb-0.5">Case Summary:</strong>
                      {req.summary}
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Created: {new Date(req.created_at).toLocaleString()}</span>
                    </div>
                    <span>Updated: {new Date(req.updated_at || req.created_at).toLocaleString()}</span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

      </div>
    </MainLayout>
  );
};

export default UserSupport;
