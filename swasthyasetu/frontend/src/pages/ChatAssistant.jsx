import React from 'react';
import MainLayout from '../layouts/MainLayout';
import FloatingChatWidget from '../components/FloatingChatWidget';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { Bot, Sparkles, MessageSquare, ShieldCheck, FileSearch, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ChatAssistant = () => {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-8 py-6">
        
        {/* HERO BANNER */}
        <div className="bg-gradient-to-br from-[#0B2545] via-[#0F4C5C] to-[#126E82] text-white rounded-2xl p-8 sm:p-10 shadow-md border border-slate-800 text-center space-y-4">
          <div className="w-14 h-14 bg-teal-500/20 text-teal-300 rounded-2xl flex items-center justify-center mx-auto border border-teal-400/30 shadow-xs">
            <Bot className="w-8 h-8" />
          </div>
          
          <div className="space-y-2 max-w-xl mx-auto">
            <Badge variant="brand" size="sm" className="!bg-teal-950/80 !text-teal-300 !border-teal-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Grounded RAG Assistant</span>
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              KAAPAN AI Assistant
            </h1>
            <p className="text-xs sm:text-sm text-slate-200/90 leading-relaxed">
              Your AI assistant is active in the floating window (bottom-right). Ask questions about Ayushman Bharat PM-JAY, CMCHIS, eligibility requirements, or verification documents.
            </p>
          </div>
        </div>

        {/* FEATURE CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Card hoverEffect className="space-y-2 text-center">
            <FileSearch className="w-6 h-6 text-[#0F4C5C] mx-auto" />
            <h3 className="text-sm font-bold text-slate-900">Scheme Search</h3>
            <p className="text-xs text-slate-500">Query over 130 verified government health schemes using natural language.</p>
          </Card>

          <Card hoverEffect className="space-y-2 text-center">
            <ShieldCheck className="w-6 h-6 text-emerald-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900">Eligibility Queries</h3>
            <p className="text-xs text-slate-500">Ask about household income caps, age limits, and state residency rules.</p>
          </Card>

          <Card hoverEffect className="space-y-2 text-center">
            <MessageSquare className="w-6 h-6 text-indigo-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900">Document Lists</h3>
            <p className="text-xs text-slate-500">Get instant checklists for Aadhaar, ration card, and income certificates.</p>
          </Card>
        </div>

        {/* Action Link */}
        <div className="text-center pt-2">
          <Link to="/schemes" className="inline-flex items-center space-x-1 text-xs font-bold text-[#0F4C5C] hover:underline">
            <span>Or browse the full schemes directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Force Open Floating Assistant */}
        <FloatingChatWidget forceOpen={true} />

      </div>
    </MainLayout>
  );
};

export default ChatAssistant;
