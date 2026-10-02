import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getSchemes } from '../services/api';
import MainLayout from '../layouts/MainLayout';
import SchemeCarousel from '../components/SchemeCarousel';
import { getSchemeImage } from '../lib/schemeImages';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  Bot, 
  ArrowRight, 
  Sparkles,
  ExternalLink,
  SlidersHorizontal,
  Lock,
  Compass
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [schemes, setSchemes] = useState([]);
  const [filteredSchemes, setFilteredSchemes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    const fetchCatalogue = async () => {
      setIsLoadingSchemes(true);
      try {
        const data = await getSchemes();
        setSchemes(data || []);
        setFilteredSchemes(data || []);
      } catch (err) {
        console.error('Failed to load schemes:', err);
      } finally {
        setIsLoadingSchemes(false);
      }
    };
    fetchCatalogue();
  }, []);

  // Filter handler
  useEffect(() => {
    let result = schemes;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          (s.scheme_name && s.scheme_name.toLowerCase().includes(q)) ||
          (s.scheme_code && s.scheme_code.toLowerCase().includes(q)) ||
          (s.description && s.description.toLowerCase().includes(q))
      );
    }

    if (stateFilter) {
      if (stateFilter === 'National') {
        result = result.filter(
          (s) =>
            (s.state_or_region || s.jurisdiction || '').toLowerCase() === 'india' ||
            (s.state_or_region || s.jurisdiction || '').toLowerCase() === 'central'
        );
      } else {
        result = result.filter(
          (s) =>
            (s.state_or_region || s.jurisdiction || '').toLowerCase().includes(stateFilter.toLowerCase()) ||
            (s.state_or_region || s.jurisdiction || '').toLowerCase() === 'india'
        );
      }
    }

    if (categoryFilter) {
      result = result.filter((s) => (s.category || '').toLowerCase().includes(categoryFilter.toLowerCase()));
    }

    setFilteredSchemes(result);
  }, [searchQuery, stateFilter, categoryFilter, schemes]);

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Citizen';

  return (
    <MainLayout>
      <div className="space-y-16 pb-12">
        
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#102A43] via-[#0F4C5C] to-[#126E82] text-white rounded-3xl p-6 sm:p-10 lg:p-12 shadow-xl border border-slate-700/60">
          <div className="absolute -right-24 -top-24 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-24 -bottom-24 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* HERO LEFT: Copy & Action CTAs */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-2 bg-teal-950/70 border border-teal-400/30 px-3.5 py-1.5 rounded-full text-xs font-semibold text-teal-300">
                <Sparkles className="w-4 h-4 text-teal-300 animate-pulse" />
                <span>Government Health Benefits, Made Easier</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white">
                Discover Health Schemes & Verify Your Entitlements
              </h1>

              <p className="text-sm sm:text-base text-slate-200/90 leading-relaxed max-w-2xl font-normal">
                KAAPAN helps Indian citizens discover government health insurance schemes, evaluate eligibility using deterministic rule accuracy, find required documents, and access verified official application links.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link to="/profile">
                  <Button variant="secondary" size="lg" icon={CheckCircle2}>
                    Check My Eligibility
                  </Button>
                </Link>
                <Link to="/schemes">
                  <Button variant="outline" size="lg" className="!bg-white/10 !text-white !border-white/30 hover:!bg-white/20" icon={Search}>
                    Explore All Schemes
                  </Button>
                </Link>
              </div>

              {/* Greeting & Active Profile Badge */}
              <div className="pt-4 border-t border-white/10 flex items-center space-x-3 text-xs text-slate-300">
                <div className="w-9 h-9 bg-teal-500/20 text-teal-200 rounded-full flex items-center justify-center font-bold uppercase border border-teal-400/30">
                  {displayName.charAt(0)}
                </div>
                <div>
                  <span className="text-slate-300">Welcome, </span>
                  <strong className="text-white font-semibold">{displayName}</strong>
                  <span className="block text-[11px] text-teal-300">Citizen Profile Connected</span>
                </div>
              </div>
            </div>

            {/* HERO RIGHT: Interactive Visual Card Split */}
            <div className="lg:col-span-5">
              <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-5 shadow-2xl text-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                      Verified Scheme Hub
                    </span>
                  </div>
                  <Badge variant="verified" size="sm" showDot>
                    Deterministic Rules
                  </Badge>
                </div>

                <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-teal-500/20 text-teal-300 rounded-lg flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-white block font-semibold">Active Schemes Indexed</strong>
                      <span className="text-slate-400 text-[11px]">Central & State Healthcare Coverage</span>
                    </div>
                  </div>
                  <span className="text-teal-300 font-extrabold text-sm bg-teal-950 px-2.5 py-1 rounded-md border border-teal-800">
                    {schemes.length || 13} Active
                  </span>
                </div>

                <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60 space-y-2">
                  <div className="flex items-center justify-between text-slate-300 text-[11px]">
                    <span className="flex items-center space-x-1.5 font-medium">
                      <Bot className="w-3.5 h-3.5 text-teal-400" />
                      <span>Vectorless RAG Assistant</span>
                    </span>
                    <span className="text-emerald-400 font-bold">Online</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Ask KAAPAN AI about eligibility, required document checklists, and application desks with verified citations.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* PHASE 3 (STEP 3): LIC-INSPIRED INTERACTIVE SCHEME CAROUSEL */}
        <section>
          <SchemeCarousel schemes={schemes} />
        </section>

        {/* PHASE 3 (STEP 4): SCHEME DISCOVERY EXPLORER & FILTERS */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-2xl font-extrabold text-[#102A43] tracking-tight flex items-center gap-2">
                <Compass className="w-6 h-6 text-[#0F766E]" />
                <span>Explore Government Scheme Catalogue</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Filter schemes by jurisdiction, category, or search keywords.
              </p>
            </div>
            
            {/* Active Count */}
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg self-start sm:self-auto border border-slate-200">
              Showing {filteredSchemes.length} of {schemes.length} Schemes
            </span>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="md:col-span-6 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search scheme name, category, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:bg-white transition-all"
              />
            </div>

            {/* Jurisdiction Dropdown */}
            <div className="md:col-span-3">
              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:bg-white cursor-pointer"
              >
                <option value="">All Jurisdictions</option>
                <option value="National">Central / National Schemes</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Kerala">Kerala</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            <div className="md:col-span-3 flex items-center">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStateFilter('');
                  setCategoryFilter('');
                }}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center space-x-1.5 border border-slate-200"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            </div>
          </div>

          {/* Scheme Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchemes.map((scheme) => {
              const imgInfo = getSchemeImage(scheme.scheme_code || scheme.scheme_id);
              const officialUrl = scheme.official_url || scheme.source_url;

              return (
                <div
                  key={scheme.id || scheme.scheme_id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    {/* Image Header */}
                    <div className="relative h-44 bg-slate-900 overflow-hidden">
                      <img
                        src={imgInfo.url}
                        alt={imgInfo.alt}
                        width="400"
                        height="200"
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3 flex gap-1.5">
                        <span className="bg-[#102A43]/90 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-white/20">
                          {scheme.state_or_region || scheme.jurisdiction || 'India'}
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 space-y-2">
                      <h3 className="text-base font-bold text-[#102A43] leading-snug group-hover:text-[#0F766E] transition-colors line-clamp-2">
                        {scheme.scheme_name}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {scheme.description || scheme.short_description || scheme.brief_details}
                      </p>
                    </div>
                  </div>

                  {/* Actions & Links */}
                  <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-100 mt-4 pt-3">
                    <Link
                      to={`/schemes/${scheme.scheme_code || scheme.scheme_id || scheme.id}`}
                      className="text-xs font-bold text-[#0F766E] hover:text-[#0B3C49] inline-flex items-center space-x-1"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    {officialUrl && officialUrl.startsWith('http') && (
                      <a
                        href={officialUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-slate-500 hover:text-slate-800 inline-flex items-center space-x-1"
                      >
                        <span>Portal</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* PHASE 3 (STEP 6): HOW IT WORKS (3 STEPS) */}
        <section className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xs space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl font-extrabold text-[#102A43] tracking-tight">
              How KAAPAN Works for Indian Citizens
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Three simple steps to discover, verify eligibility, and access government health entitlements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-3 relative">
              <div className="w-10 h-10 bg-[#102A43] text-white font-extrabold text-sm rounded-xl flex items-center justify-center shadow-xs">
                01
              </div>
              <h3 className="text-base font-bold text-[#102A43]">Discover Health Schemes</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Search central and state schemes including PM-JAY, CMCHIS, ESIC, CGHS, and specialized programmes in one unified catalogue.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-3 relative">
              <div className="w-10 h-10 bg-[#0F766E] text-white font-extrabold text-sm rounded-xl flex items-center justify-center shadow-xs">
                02
              </div>
              <h3 className="text-base font-bold text-[#102A43]">Evaluate Eligibility</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Enter your state, age, and income details. Our deterministic rules engine checks exact eligibility criteria without AI guesses.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-3 relative">
              <div className="w-10 h-10 bg-[#126E82] text-white font-extrabold text-sm rounded-xl flex items-center justify-center shadow-xs">
                03
              </div>
              <h3 className="text-base font-bold text-[#102A43]">Get Application Guidance</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                View required document checklists, step-by-step application flows, and direct official government portal links.
              </p>
            </div>
          </div>
        </section>

        {/* PHASE 3 (STEP 7): TRUST & TRANSPARENCY SECTION */}
        <section className="bg-gradient-to-br from-[#102A43] to-[#0F4C5C] text-white rounded-3xl p-8 sm:p-10 shadow-lg border border-slate-800 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-700/80 pb-6">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 bg-teal-950/80 border border-teal-500/30 px-3 py-1 rounded-full text-xs text-teal-300 font-semibold">
                <Lock className="w-3.5 h-3.5 text-teal-300" />
                <span>Trust & Data Provenance</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                Grounded in Verified Official Government Data
              </h2>
            </div>
            <Link to="/chat">
              <Button variant="secondary" icon={Bot}>
                Ask KAAPAN AI Assistant
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-200/90 leading-relaxed">
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/60 space-y-2">
              <strong className="text-white block font-bold text-sm">Official Guidelines Only</strong>
              <p>
                All policy details, coverage limits, and document checklists are indexed directly from official central and state government notifications.
              </p>
            </div>

            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/60 space-y-2">
              <strong className="text-white block font-bold text-sm">Deterministic Rule Execution</strong>
              <p>
                Personalized eligibility results are computed using strict deterministic conditions. AI LLMs are never allowed to hallucinate eligibility outcomes.
              </p>
            </div>

            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/60 space-y-2">
              <strong className="text-white block font-bold text-sm">Vectorless RAG Retrieval</strong>
              <p>
                Our PageIndex document tree engine navigates actual section trees and pages to present traceable citations with official source links.
              </p>
            </div>
          </div>
        </section>

      </div>
    </MainLayout>
  );
};

export default Dashboard;
