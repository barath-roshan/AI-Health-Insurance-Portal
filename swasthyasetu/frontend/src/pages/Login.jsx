import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import MainLayout from '../layouts/MainLayout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { ShieldCheck, LogIn, AlertCircle, CheckCircle2, Sparkles, Lock, Mail } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, user, isSupabaseConfigured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to login. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto my-6 lg:my-12">
        
        {/* SPLIT DESKTOP LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* LEFT: Branding & Value Proposition (Hidden on small screens, visible on LG) */}
          <div className="lg:col-span-6 bg-gradient-to-br from-[#0B2545] via-[#0F4C5C] to-[#126E82] text-white p-8 sm:p-10 rounded-2xl shadow-md border border-slate-700/50 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 bg-teal-950/80 border border-teal-400/30 px-3 py-1 rounded-full text-xs font-semibold text-teal-300">
                <ShieldCheck className="w-4 h-4 text-teal-300" />
                <span>Government Citizen Portal</span>
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
                Welcome to KAAPAN
              </h1>

              <p className="text-sm text-slate-200/90 leading-relaxed font-normal">
                Your trusted guide to government health insurance benefits. Access 130+ verified schemes, check eligibility, and get AI-assisted guidance.
              </p>

              <div className="space-y-2.5 pt-4 border-t border-white/10 text-xs text-slate-200">
                {[
                  'Instant scheme eligibility matching',
                  'Document verification checklists',
                  'AI & Human support handoffs',
                  'Secure government citizen portal',
                ].map((feat, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-[11px] text-teal-200/80 pt-4 border-t border-white/10">
              © 2026 KAAPAN Initiative • Safe & Confidential
            </div>
          </div>

          {/* RIGHT: Compact Authentication Card */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <Card className="p-8 space-y-6 shadow-sm">
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Citizen Sign In</h2>
                <p className="text-xs text-slate-500">Access KAAPAN Health Benefits Portal</p>
              </div>

              {!isSupabaseConfigured && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl">
                  <strong className="font-semibold block mb-0.5">Configuration Notice:</strong>
                  Supabase environment variables are currently unconfigured or using placeholders in <code>.env</code>.
                </div>
              )}

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[#0F4C5C] focus:bg-white outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[#0F4C5C] focus:bg-white outline-none transition"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full mt-2"
                  isLoading={isSubmitting}
                  icon={LogIn}
                >
                  Sign In to KAAPAN
                </Button>
              </form>

              <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-600">
                Don't have an account yet?{' '}
                <Link to="/register" className="font-bold text-[#0F4C5C] hover:underline">
                  Create citizen account
                </Link>
              </div>
            </Card>
          </div>

        </div>

      </div>
    </MainLayout>
  );
};

export default Login;
