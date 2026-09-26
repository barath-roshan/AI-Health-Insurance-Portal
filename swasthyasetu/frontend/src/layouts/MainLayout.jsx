import React from 'react';
import Navbar from '../components/Navbar';
import FloatingChatWidget from '../components/FloatingChatWidget';

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 relative">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-6 text-center text-xs">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 KAAPAN — Your Guide to Government Health Benefits. Government of India Initiative.</p>
        </div>
      </footer>
      <FloatingChatWidget />
    </div>
  );
};

export default MainLayout;
