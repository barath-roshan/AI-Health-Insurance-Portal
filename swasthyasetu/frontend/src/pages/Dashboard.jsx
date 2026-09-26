import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getBackendHealth } from '../services/api';
import MainLayout from '../layouts/MainLayout';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  UserCheck, 
  Bot, 
  FileText, 
  ArrowRight, 
  Activity, 
  Sparkles,
  HelpCircle,
  Clock,
  ChevronRight
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [backendHealth, setBackendHealth] = useState(null);
  const [healthError, setHealthError] = useState(null);
  const [isHealthLoading, setIsHealthLoading] = useState(true);

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

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Citizen';

  return (
    <MainLayout>
      <div className="space-y-12 pb-8">
        
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#0B2545] via-[#0F4C5C] to-[#126E82] text-white rounded-2xl p-6 sm:p-10 lg:p-12 shadow-md border border-slate-700/50">
          {/* Subtle background glow pattern */}
          <div className="absolute -right-20 -top-20 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* HERO LEFT: Copy & CTAs */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-2 bg-teal-950/60 border border-teal-400/30 px-3 py-1 rounded-full text-xs font-semibold text-teal-300">
                <Sparkles className="w-3.5 h-3.5 text-teal-300 animate-pulse" />
                <span>Government Health Benefits • AI Assisted</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white">
                Find the Government Health Benefits You May Be Eligible For
              </h1>

              <p className="text-sm sm:text-base text-slate-200/90 leading-relaxed max-w-2xl font-normal">
                KAAPAN helps you discover government health schemes, understand eligibility, prepare documents and get trusted guidance — all in one place.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link to="/profile">
                  <Button variant="secondary" size="lg" icon={CheckCircle2}>
                    Check My Eligibility
                  </Button>
                </Link>
                <Link to="/schemes">
                  <Button variant="outline" size="lg" className="!bg-white/10 !text-white !border-white/30 hover:!bg-white/20" icon={Search}>
                    Explore Schemes
                  </Button>
                </Link>
              </div>

              {/* Citizen Greeting badge */}
              <div className="pt-4 border-t border-white/10 flex items-center space-x-3 text-xs text-slate-300">
                <div className="w-8 h-8 bg-teal-500/20 text-teal-200 rounded-full flex items-center justify-center font-bold uppercase border border-teal-400/20">
                  {displayName.charAt(0)}
                </div>
                <div>
                  <span className="text-slate-300">Welcome back, </span>
                  <strong className="text-white font-semibold">{displayName}</strong>
                </div>
              </div>
            </div>

            {/* HERO RIGHT: Interactive Visual Dashboard Composition Card */}
            <div className="lg:col-span-5">
              <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-5 shadow-xl text-xs space-y-4">
                
                {/* Header status bar */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                      Citizen Overview
                    </span>
                  </div>
                  <Badge variant="verified" size="sm" showDot>
                    Profile Active
                  </Badge>
                </div>

                {/* Card Item 1: Profile completion */}
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-teal-900/60 text-teal-300 rounded-lg flex items-center justify-center font-bold">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white">Demographics & State</div>
                      <div className="text-[11px] text-slate-400">Targeting regional criteria</div>
                    </div>
                  </div>
                  <span className="text-emerald-400 font-semibold text-xs bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                    Ready
                  </span>
                </div>

                {/* Card Item 2: Recommended Schemes */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Recommended Schemes Evaluation
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                      <div className="font-bold text-white flex items-center justify-between">
                        <span>CMCHIS</span>
                        <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                      </div>
                      <div className="text-[10px] text-emerald-400 font-medium mt-1">✓ Eligible</div>
                    </div>

                    <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                      <div className="font-bold text-white flex items-center justify-between">
                        <span>PM-JAY</span>
                        <span className="w-2 h-2 bg-amber-400 rounded-full" />
                      </div>
                      <div className="text-[10px] text-amber-300 font-medium mt-1">Review Criteria</div>
                    </div>
                  </div>
                </div>

                {/* Card Item 3: Required Documents & AI snippet */}
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 flex items-center justify-between text-[11px]">
                  <div className="flex items-center space-x-2 text-slate-300">
                    <FileText className="w-4 h-4 text-teal-400" />
                    <span>3 Verification Docs Needed</span>
                  </div>
                  <Link to="/chat" className="text-teal-300 hover:text-teal-200 font-semibold flex items-center gap-1">
                    <span>Ask AI</span>
                    <Bot className="w-3.5 h-3.5" />
                  </Link>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* TRUST STRIP (Immediately Below Hero) */}
        <section className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-2xs">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs font-medium text-slate-700">
            {[
              'Verified Scheme Information',
              'Eligibility Guidance',
              'Document Assistance',
              'AI-Powered Assistance',
              'Human Support When Needed',
            ].map((trustItem, index) => (
              <div key={index} className="flex items-center space-x-2 bg-slate-50/80 p-2.5 rounded-lg border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="leading-snug">{trustItem}</span>
              </div>
            ))}
          </div>
        </section>

        {/* HOW KAAPAN WORKS (4-Step Section) */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <Badge variant="brand" size="sm">4-Step Guided Process</Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              How KAAPAN Works For You
            </h2>
            <p className="text-sm text-slate-600">
              Four simple steps to discover, verify, and access your government health benefits.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                step: '01',
                title: 'Tell Us About Yourself',
                desc: 'Enter state, district, household income, and family details to evaluate eligibility rules.',
                link: '/profile',
                cta: 'Update Profile',
              },
              {
                step: '02',
                title: 'Check Available Schemes',
                desc: 'Explore 130+ central and state health schemes with transparent benefit summaries.',
                link: '/schemes',
                cta: 'Browse Catalog',
              },
              {
                step: '03',
                title: 'Understand Your Eligibility',
                desc: 'Review deterministic rule breakdowns explaining why your profile matches specific schemes.',
                link: '/results',
                cta: 'View Results',
              },
              {
                step: '04',
                title: 'Get Guidance to Apply',
                desc: 'Use our AI Assistant for document checklists or request human customer support.',
                link: '/chat',
                cta: 'Launch AI Assistant',
              },
            ].map((st, i) => (
              <Card key={i} hoverEffect className="flex flex-col justify-between space-y-4 relative group">
                <div className="space-y-3">
                  <div className="w-10 h-10 bg-[#0F4C5C]/10 text-[#0F4C5C] font-extrabold rounded-xl flex items-center justify-center text-sm font-mono border border-[#0F4C5C]/20 group-hover:bg-[#0F4C5C] group-hover:text-white transition-colors">
                    {st.step}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">{st.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{st.desc}</p>
                </div>
                <Link
                  to={st.link}
                  className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#0F4C5C] hover:text-[#0B3C49] pt-2 border-t border-slate-100"
                >
                  <span>{st.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Card>
            ))}
          </div>
        </section>

        {/* BACKEND STATUS WIDGET */}
        <section className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                KAAPAN Service Operational Health
              </h3>
            </div>
            <button
              onClick={() => {
                setIsHealthLoading(true);
                getBackendHealth()
                  .then((d) => { setBackendHealth(d); setHealthError(null); })
                  .catch((e) => setHealthError(e.message))
                  .finally(() => setIsHealthLoading(false));
              }}
              className="text-xs font-medium text-teal-700 hover:text-teal-900 underline flex items-center gap-1 cursor-pointer"
            >
              <span>Refresh Status</span>
            </button>
          </div>

          {isHealthLoading ? (
            <div className="flex items-center space-x-2 text-xs text-slate-500 py-1">
              <div className="w-3.5 h-3.5 border-2 border-[#0F4C5C] border-t-transparent rounded-full animate-spin" />
              <span>Checking backend API operational state...</span>
            </div>
          ) : healthError ? (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center space-x-2">
              <span className="w-2 h-2 bg-rose-500 rounded-full" />
              <span>Backend Service Notice: {healthError}</span>
            </div>
          ) : (
            <div className="p-3 bg-emerald-50/80 border border-emerald-200/80 rounded-lg text-emerald-900 text-xs flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="font-bold">FastAPI & RAG Microservice:</span>
                <span>Operational (Service: <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono">{backendHealth?.service}</code>)</span>
              </div>
              <Badge variant="verified" size="sm">
                STATUS: {backendHealth?.status?.toUpperCase()}
              </Badge>
            </div>
          )}
        </section>

        {/* PRIMARY ACTION CARDS */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Find Health Schemes */}
          <Card hoverEffect className="flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 bg-teal-50 text-teal-800 rounded-xl flex items-center justify-center font-bold border border-teal-200/60">
                <Search className="w-5 h-5 text-teal-700" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Explore Scheme Catalog</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Browse 130 verified central and state government health insurance schemes with full benefit breakdowns.
              </p>
            </div>
            <Link to="/schemes">
              <Button variant="outline" size="sm" className="w-full" icon={ArrowRight} iconPosition="right">
                Explore Health Schemes
              </Button>
            </Link>
          </Card>

          {/* Card 2: Complete Profile */}
          <Card hoverEffect className="flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-800 rounded-xl flex items-center justify-center font-bold border border-indigo-200/60">
                <UserCheck className="w-5 h-5 text-indigo-700" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Update Citizen Profile</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Keep your state, district, income, and family details accurate to get exact eligibility results.
              </p>
            </div>
            <Link to="/profile">
              <Button variant="primary" size="sm" className="w-full" icon={ArrowRight} iconPosition="right">
                Edit Profile & Check Rules
              </Button>
            </Link>
          </Card>

          {/* Card 3: Ask AI Assistant */}
          <Card hoverEffect className="flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-800 rounded-xl flex items-center justify-center font-bold border border-emerald-200/60">
                <Bot className="w-5 h-5 text-emerald-700" />
              </div>
              <h3 className="text-base font-bold text-slate-900">AI Health Assistant</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Chat with our grounded RAG assistant powered by HuggingFace E5 embeddings, pgvector, and Groq LLM.
              </p>
            </div>
            <Link to="/chat">
              <Button variant="secondary" size="sm" className="w-full" icon={ArrowRight} iconPosition="right">
                Launch AI Assistant
              </Button>
            </Link>
          </Card>
        </section>

      </div>
    </MainLayout>
  );
};

export default Dashboard;
