import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { checkEligibility, getProfile } from '../services/api';
import MainLayout from '../layouts/MainLayout';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import { 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  XCircle, 
  Edit3, 
  ArrowRight, 
  Tag, 
  MapPin, 
  SlidersHorizontal,
  Sparkles
} from 'lucide-react';

const STATUS_CONFIG = {
  ELIGIBLE: {
    label: 'ELIGIBLE',
    badgeVariant: 'eligible',
    icon: CheckCircle2,
    border: 'border-emerald-200/90',
    bgHeader: 'bg-emerald-50/60',
  },
  NEAR_MATCH: {
    label: 'NEAR MATCH',
    badgeVariant: 'near_match',
    icon: AlertTriangle,
    border: 'border-amber-200/90',
    bgHeader: 'bg-amber-50/60',
  },
  NEEDS_INFORMATION: {
    label: 'NEEDS INFO',
    badgeVariant: 'needs_info',
    icon: HelpCircle,
    border: 'border-sky-200/90',
    bgHeader: 'bg-sky-50/60',
  },
  NOT_ELIGIBLE: {
    label: 'NOT ELIGIBLE',
    badgeVariant: 'not_eligible',
    icon: XCircle,
    border: 'border-slate-200',
    bgHeader: 'bg-slate-50/60',
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
      <div className="space-y-8">
        
        {/* HEADER HERO SECTION */}
        <div className="bg-[#0B2545] text-white rounded-2xl p-6 sm:p-10 shadow-md border border-slate-800 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-1.5 bg-teal-950/80 border border-teal-500/30 px-3 py-1 rounded-full text-xs font-semibold text-teal-300">
                <Sparkles className="w-3.5 h-3.5 text-teal-300" />
                <span>Deterministic Rules Evaluation Engine</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
                Your Scheme Results
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
                Calculated by evaluating your demographic profile against official government eligibility constraints.
              </p>
            </div>

            <Link to="/profile">
              <Button variant="secondary" size="md" icon={Edit3}>
                Edit Profile Data
              </Button>
            </Link>
          </div>

          {/* Citizen Profile Summary Banner */}
          {userProfile && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-300">
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">State / Region</span>
                <strong className="text-white text-xs">{userProfile.state || 'Not Specified'}</strong>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Age & Gender</span>
                <strong className="text-white text-xs">{userProfile.age ? `${userProfile.age} Yrs` : 'N/A'} • {userProfile.gender || 'N/A'}</strong>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Household Income</span>
                <strong className="text-white text-xs">{userProfile.annual_income ? `₹${userProfile.annual_income.toLocaleString()}/yr` : 'N/A'}</strong>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Evaluated Schemes</span>
                <strong className="text-emerald-400 text-xs">{counts.ALL} Total ({counts.ELIGIBLE} Eligible)</strong>
              </div>
            </div>
          )}
        </div>

        {/* CATEGORY STATUS FILTER TABS */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200/90 pb-3">
          {[
            { key: 'ALL', label: 'All Schemes', variant: 'neutral' },
            { key: 'ELIGIBLE', label: 'Eligible Matches', variant: 'eligible' },
            { key: 'NEAR_MATCH', label: 'Near Match', variant: 'near_match' },
            { key: 'NEEDS_INFORMATION', label: 'Needs Info', variant: 'needs_info' },
            { key: 'NOT_ELIGIBLE', label: 'Not Eligible', variant: 'not_eligible' }
          ].map((tab) => {
            const isActive = activeTab === tab.key;
            const count = counts[tab.key] || 0;

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-150 flex items-center space-x-2 border cursor-pointer ${
                  isActive
                    ? 'bg-[#0F4C5C] text-white border-[#0F4C5C] shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm rounded-xl">
            {error}
          </div>
        )}

        {/* RESULTS CARDS LIST */}
        {loading ? (
          <div className="py-16 text-center space-y-3 max-w-md mx-auto">
            <div className="w-10 h-10 border-4 border-[#0F4C5C] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-500 text-sm font-medium">Evaluating scheme rule constraints...</p>
          </div>
        ) : filteredResults.length === 0 ? (
          <EmptyState
            title="No schemes match this status tab"
            description="Try selecting a different status filter above or edit your citizen profile inputs."
            actionLabel="View All Evaluated Schemes"
            onAction={() => setActiveTab('ALL')}
          />
        ) : (
          <div className="space-y-4">
            {filteredResults.map((result) => {
              const statusCfg = STATUS_CONFIG[result.status] || STATUS_CONFIG.NOT_ELIGIBLE;
              const StatusIcon = statusCfg.icon;

              return (
                <Card
                  key={result.scheme_id}
                  hoverEffect
                  className={`border ${statusCfg.border} overflow-hidden space-y-4`}
                >
                  {/* Card Header Bar */}
                  <div className={`-mx-6 -mt-6 p-4 px-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${statusCfg.bgHeader}`}>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Badge variant={result.category?.toLowerCase() === 'central' ? 'central' : 'state'} size="sm">
                          {result.category || 'Central'}
                        </Badge>
                        <span className="text-[11px] text-slate-600 font-medium flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{result.state_or_region || 'All India'}</span>
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 leading-snug">
                        {result.scheme_name}
                      </h3>
                    </div>

                    <Badge variant={statusCfg.badgeVariant} size="md" showDot>
                      {statusCfg.label}
                    </Badge>
                  </div>

                  {/* Bullet Explanations: Rule Breakdown */}
                  <div className="bg-slate-50/90 border border-slate-200/70 rounded-xl p-4 space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Rule Evaluation Rationale:
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-800">
                      {result.explanation?.map((exp, i) => (
                        <li key={i} className="flex items-start space-x-2 leading-relaxed">
                          <span className="text-[#0F4C5C] font-bold flex-shrink-0">•</span>
                          <span className="font-mono text-[11px] text-slate-700">{exp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Footer & Details Link */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-mono">
                      <Tag className="w-3.5 h-3.5 text-slate-400" />
                      <span>Code: {result.scheme_code}</span>
                    </div>

                    <Link to={`/schemes/${result.scheme_id}`}>
                      <Button variant="primary" size="sm" icon={ArrowRight} iconPosition="right">
                        View Scheme Details
                      </Button>
                    </Link>
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

export default EligibilityResults;
