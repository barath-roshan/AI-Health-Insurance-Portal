import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const displayName = user?.user_metadata?.full_name || user?.email || 'User';

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center font-bold text-lg text-white shadow-sm">
            SS
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white block leading-none">
              SwasthyaSetu
            </span>
            <span className="text-[10px] uppercase tracking-wider text-emerald-400 block font-medium">
              National Health Scheme Portal
            </span>
          </div>
        </Link>

        {user && (
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/dashboard" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link to="/profile" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              My Profile
            </Link>
            <Link to="/results" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Eligibility Results
            </Link>
            <Link to="/schemes" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Health Schemes
            </Link>
          </div>
        )}

        <nav className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-300 hidden md:inline-block">
                <strong className="text-white">{displayName}</strong>
              </span>
              <button
                onClick={handleLogout}
                className="px-3.5 py-1.5 text-sm font-medium text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors border border-slate-700"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                to="/login"
                className="px-3.5 py-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-md transition-colors shadow-sm"
              >
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
