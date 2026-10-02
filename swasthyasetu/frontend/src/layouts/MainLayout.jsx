import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import FloatingChatWidget from '../components/FloatingChatWidget';
import KaapanLogo from '../components/ui/KaapanLogo';
import { Lock, ExternalLink } from 'lucide-react';

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 relative font-sans">
      {/* Sticky Header Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {children}
      </main>

      {/* Redesigned Multi-column Government Health Portal Footer */}
      <footer className="bg-[#102A43] border-t border-slate-800 text-slate-300 py-12 mt-16 text-xs sm:text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-slate-700/60">
            {/* Column 1: Brand & Purpose */}
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="px-3.5 py-1.5 bg-[#0F766E] rounded-xl flex items-center justify-center text-white shadow-xs border border-teal-500/30">
                  <KaapanLogo variant="light" height={28} />
                </div>
                <div>
                  <p className="text-[11px] text-teal-300 font-medium">Your Guide to Government Health Benefits</p>
                </div>
              </div>

              <p className="text-xs text-slate-300/90 leading-relaxed max-w-md">
                KAAPAN is an AI-assisted discovery platform helping Indian citizens understand government health insurance schemes, verify eligibility criteria, and access official application portals.
              </p>

              <div className="inline-flex items-center space-x-2 bg-slate-900/60 border border-slate-700 px-3 py-1.5 rounded-lg text-[11px] text-slate-300">
                <Lock className="w-3.5 h-3.5 text-teal-400" />
                <span>Deterministic Rules Engine • Verified Sources Only</span>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div className="md:col-span-3 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Navigation</h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/dashboard" className="hover:text-teal-300 transition-colors">Citizen Dashboard</Link></li>
                <li><Link to="/schemes" className="hover:text-teal-300 transition-colors">Explore All Schemes</Link></li>
                <li><Link to="/results" className="hover:text-teal-300 transition-colors">Check Eligibility</Link></li>
                <li><Link to="/profile" className="hover:text-teal-300 transition-colors">My Health Profile</Link></li>
                <li><Link to="/support" className="hover:text-teal-300 transition-colors">Citizen Support Handoff</Link></li>
              </ul>
            </div>

            {/* Column 3: Official Portals */}
            <div className="md:col-span-4 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Official Government Portals</h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a href="https://pmjay.gov.in" target="_blank" rel="noreferrer" className="inline-flex items-center space-x-1 hover:text-teal-300 transition-colors">
                    <span>Ayushman Bharat PM-JAY</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                </li>
                <li>
                  <a href="https://www.cmchistn.com" target="_blank" rel="noreferrer" className="inline-flex items-center space-x-1 hover:text-teal-300 transition-colors">
                    <span>CMCHIS Tamil Nadu</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                </li>
                <li>
                  <a href="https://nhm.gov.in" target="_blank" rel="noreferrer" className="inline-flex items-center space-x-1 hover:text-teal-300 transition-colors">
                    <span>National Health Mission (NHM)</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                </li>
                <li>
                  <a href="https://abha.abdm.gov.in" target="_blank" rel="noreferrer" className="inline-flex items-center space-x-1 hover:text-teal-300 transition-colors">
                    <span>ABHA Health ID Portal</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright & Transparency Disclaimer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
            <p>© 2026 KAAPAN Platform. Designed for Indian Citizens.</p>
            <p className="text-center sm:text-right text-slate-400">
              Personalized eligibility decisions are computed deterministically. Always verify final application steps at official government portals.
            </p>
          </div>
        </div>
      </footer>

      {/* Floating Vectorless RAG Chatbot Launcher & Modal */}
      <FloatingChatWidget />
    </div>
  );
};

export default MainLayout;
