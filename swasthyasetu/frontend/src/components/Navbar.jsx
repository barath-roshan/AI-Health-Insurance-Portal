import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  Shield, 
  Search, 
  CheckCircle2, 
  User, 
  Bot, 
  Headphones, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Sparkles
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Citizen';

  const navItems = user
    ? [
        { path: '/dashboard', label: 'Dashboard', icon: Shield },
        { path: '/schemes', label: 'Schemes', icon: Search },
        { path: '/results', label: 'Eligibility', icon: CheckCircle2 },
        { path: '/profile', label: 'Profile', icon: User },
        { path: '/chat', label: 'AI Assistant', icon: Bot, isHighlight: true },
        { path: '/support', label: 'Support', icon: Headphones },
        { path: '/admin', label: 'Admin', icon: Settings, isAdmin: true },
      ]
    : [];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-[#0B2545]/95 backdrop-blur-md text-white border-b border-slate-800 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo & Brand Identity */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-[#126E82] to-[#0F4C5C] rounded-xl flex items-center justify-center text-white shadow-md border border-teal-400/20 group-hover:scale-105 transition-transform duration-200">
            <Shield className="w-5 h-5 text-teal-200 fill-teal-200/20" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-tight text-white block leading-none font-sans">
                KAAPAN
              </span>
              <span className="text-[10px] bg-teal-500/20 text-teal-300 border border-teal-500/30 px-1.5 py-0.5 rounded font-mono font-semibold">
                GOVT HEALTH
              </span>
            </div>
            <span className="text-[10px] font-medium text-slate-300 block tracking-wide mt-0.5">
              Your Guide to Government Health Benefits
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        {user && (
          <nav className="hidden lg:flex items-center space-x-1 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800/80">
            {navItems.map((item) => {
              const ItemIcon = item.icon;
              const active = isActive(item.path);

              if (item.isAdmin) {
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      active
                        ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                        : 'text-rose-400 hover:text-rose-300 hover:bg-rose-950/40'
                    }`}
                  >
                    <ItemIcon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </Link>
                );
              }

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? 'bg-[#0F4C5C] text-white shadow-xs font-semibold'
                      : item.isHighlight
                      ? 'text-teal-300 hover:text-white hover:bg-teal-900/40'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <ItemIcon className={`w-3.5 h-3.5 ${item.isHighlight ? 'text-teal-400' : ''}`} />
                  <span>{item.label}</span>
                  {item.isHighlight && (
                    <Sparkles className="w-2.5 h-2.5 text-teal-300 animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>
        )}

        {/* User Account / Auth Actions */}
        <div className="hidden md:flex items-center space-x-3">
          {user ? (
            <div className="flex items-center space-x-3 pl-3 border-l border-slate-800">
              <div className="flex items-center space-x-2 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
                <div className="w-6 h-6 bg-teal-800 text-teal-200 rounded-full flex items-center justify-center text-xs font-bold uppercase">
                  {displayName.charAt(0)}
                </div>
                <span className="text-xs font-medium text-slate-200 max-w-[120px] truncate">
                  {displayName}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/90 hover:bg-slate-700/90 rounded-lg transition border border-slate-700 cursor-pointer"
                title="Sign out of KAAPAN"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-xs font-semibold bg-[#126E82] hover:bg-[#0F4C5C] text-white rounded-lg transition shadow-xs"
              >
                Check Eligibility
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Menu Toggle */}
        <div className="flex lg:hidden items-center space-x-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-300 hover:text-white bg-slate-800/80 rounded-lg border border-slate-700"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0B2545] border-b border-slate-800 px-4 py-4 space-y-2 animate-in fade-in duration-150">
          {user ? (
            <>
              <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 mb-3 flex items-center space-x-3">
                <div className="w-8 h-8 bg-teal-800 text-teal-200 rounded-full flex items-center justify-center text-xs font-bold uppercase">
                  {displayName.charAt(0)}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">{displayName}</div>
                  <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {navItems.map((item) => {
                  const ItemIcon = item.icon;
                  const active = isActive(item.path);

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-2 p-2.5 rounded-lg text-xs font-medium transition ${
                        active
                          ? 'bg-[#0F4C5C] text-white font-semibold'
                          : item.isHighlight
                          ? 'bg-teal-950/50 text-teal-300 border border-teal-800/50'
                          : 'bg-slate-900/60 text-slate-300 hover:text-white'
                      }`}
                    >
                      <ItemIcon className="w-4 h-4 flex-shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-slate-800 mt-3">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center justify-center space-x-2 p-2.5 bg-slate-800 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2.5 bg-slate-800 text-white text-xs font-medium rounded-lg"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2.5 bg-[#126E82] text-white text-xs font-semibold rounded-lg"
              >
                Check Eligibility
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
