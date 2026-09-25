import React from 'react';
import Navbar from '../components/Navbar';

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-6 text-center text-xs">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 SwasthyaSetu Health Insurance Scheme Eligibility Finder. Government of India Initiative.</p>
          <p className="mt-1 text-slate-500">Phase 1 Foundation & Authentication Active</p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
