import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import MainLayout from '../layouts/MainLayout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { ShieldCheck, UserPlus, AlertCircle, CheckCircle2, User, Mail, Lock } from 'lucide-react';

const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, user, isSupabaseConfigured } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const validate = () => {
    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      return 'All fields are required.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return 'Please enter a valid email address.';
    }

    if (password.length < 6) {
      return 'Password must be at least 6 characters long.';
    }

    if (password !== confirmPassword) {
      return 'Passwords do not match.';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
      });

      if (data?.session) {
        navigate('/dashboard', { replace: true });
      } else {
        setSuccessMsg('Registration successful! Please check your email inbox to verify your account.');
      }
    } catch (err) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto my-6 lg:my-12">
        
        {/* SPLIT DESKTOP LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* LEFT: Branding & Features Panel */}
          <div className="lg:col-span-6 bg-gradient-to-br from-[#0B2545] via-[#0F4C5C] to-[#126E82] text-white p-8 sm:p-10 rounded-2xl shadow-md border border-slate-700/50 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 bg-teal-950/80 border border-teal-400/30 px-3 py-1 rounded-full text-xs font-semibold text-teal-300">
                <ShieldCheck className="w-4 h-4 text-teal-300" />
                <span>Join Citizen Network</span>
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
                Create Your KAAPAN Account
              </h1>

              <p className="text-sm text-slate-200/90 leading-relaxed font-normal">
                Register to save your household profile, calculate health scheme coverage, and receive AI-guided document preparation.
              </p>

              <div className="space-y-2.5 pt-4 border-t border-white/10 text-xs text-slate-200">
                {[
                  'Access 130+ verified central & state health schemes',
                  'Deterministic eligibility rule calculations',
                  'Grounded RAG AI Assistant integration',
                  'Free citizen government health-tech tool',
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

          {/* RIGHT: Registration Form Card */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <Card className="p-8 space-y-6 shadow-sm">
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Citizen Registration</h2>
                <p className="text-xs text-slate-500">Create an account to start your eligibility check</p>
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

              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Full Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ramesh Kumar"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[#0F4C5C] focus:bg-white outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Address *
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
                      placeholder="ramesh@example.com"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[#0F4C5C] focus:bg-white outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Password *
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
                      placeholder="At least 6 characters"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[#0F4C5C] focus:bg-white outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
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
                  icon={UserPlus}
                >
                  Create KAAPAN Account
                </Button>
              </form>

              <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-600">
                Already have an account?{' '}
                <Link to="/login" className="font-bold text-[#0F4C5C] hover:underline">
                  Sign in here
                </Link>
              </div>
            </Card>
          </div>

        </div>

      </div>
    </MainLayout>
  );
};

export default Register;
