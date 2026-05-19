import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Mail, Lock, AlertCircle, Activity, ShieldCheck, Stethoscope, User, ArrowRight, Sparkles } from 'lucide-react';

const DEMO_USERS = [
  {
    role: 'Admin',
    email: 'admin@test.com',
    password: '123456',
    icon: ShieldCheck,
    gradient: 'from-violet-500 to-purple-600',
    lightBg: 'bg-violet-50',
    border: 'border-violet-200 hover:border-violet-400',
    badge: 'bg-violet-100 text-violet-700',
    desc: 'Manage users, appointments & system',
  },
  {
    role: 'Doctor',
    email: 'doctor@test.com',
    password: '123456',
    icon: Stethoscope,
    gradient: 'from-emerald-500 to-teal-600',
    lightBg: 'bg-emerald-50',
    border: 'border-emerald-200 hover:border-emerald-400',
    badge: 'bg-emerald-100 text-emerald-700',
    desc: 'View & manage patient appointments',
  },
  {
    role: 'Patient',
    email: 'customer@test.com',
    password: '123456',
    icon: User,
    gradient: 'from-blue-500 to-cyan-600',
    lightBg: 'bg-blue-50',
    border: 'border-blue-200 hover:border-blue-400',
    badge: 'bg-blue-100 text-blue-700',
    desc: 'Book appointments & view history',
  },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeDemo, setActiveDemo] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      navigate(`/${data.role}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const fillAndLogin = async (demoUser) => {
    setActiveDemo(demoUser.role);
    setEmail(demoUser.email);
    setPassword(demoUser.password);
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email: demoUser.email, password: demoUser.password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      navigate(`/${data.role}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Try again.');
      setActiveDemo(null);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-animated relative overflow-hidden flex items-center justify-center p-4">
      {/* Decorative orbs */}
      <div className="orb orb-blue w-72 h-72 -top-16 -left-16" />
      <div className="orb orb-teal w-56 h-56 top-1/2 -right-12" />
      <div className="orb orb-violet w-64 h-64 -bottom-20 left-1/3" />

      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center relative z-10">

        {/* ── Left Panel ── */}
        <div className="space-y-8 animate-fade-up">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-3.5 rounded-2xl shadow-lg shadow-blue-200 animate-float">
                <Activity size={30} className="text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white animate-ping" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                Dental<span className="gradient-text">Care</span>
              </h1>
              <p className="text-slate-500 text-sm font-medium">Clinic Management System</p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-800 leading-snug">
              Your smile,<br />
              <span className="gradient-text">our priority.</span> 🦷
            </h2>
            <p className="text-slate-500 mt-2 text-sm leading-relaxed">
              A complete platform for managing appointments, doctors, and patients — all in one place.
            </p>
          </div>

          {/* Demo Cards */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={15} className="text-blue-500" />
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Quick Login — Click any role
              </p>
            </div>
            <div className="space-y-3">
              {DEMO_USERS.map((u) => {
                const Icon = u.icon;
                const isActive = activeDemo === u.role;
                return (
                  <button
                    key={u.role}
                    type="button"
                    onClick={() => fillAndLogin(u)}
                    disabled={loading}
                    className={`demo-card w-full flex items-center gap-4 p-4 glass border rounded-2xl text-left
                      disabled:opacity-60 disabled:cursor-not-allowed ${u.border}
                      ${isActive ? u.lightBg : 'hover:' + u.lightBg}`}
                  >
                    <div className={`bg-gradient-to-br ${u.gradient} p-2.5 rounded-xl shadow-sm flex-shrink-0`}>
                      <Icon size={20} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-slate-900 text-sm">{u.role}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${u.badge}`}>{u.role}</span>
                      </div>
                      <p className="text-xs text-slate-500 truncate">{u.email}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{u.desc}</p>
                    </div>
                    <ArrowRight size={16} className="text-slate-400 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Right — Login Form ── */}
        <div className="animate-fade-up delay-200">
          <div className="glass rounded-3xl shadow-2xl shadow-slate-200/80 p-8 border border-white/60">
            <div className="mb-8">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Welcome Back 👋</h2>
              <p className="text-slate-500 text-sm mt-1">Sign in to your account to continue</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-5 flex items-center gap-2 text-sm animate-fade-in">
                <AlertCircle size={17} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                <div className="relative">
                  <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                id="login-submit"
                disabled={loading}
                className="w-full btn-primary py-3 rounded-xl text-sm disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Sign In <ArrowRight size={16} />
                  </span>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100 text-center">
              <p className="text-sm text-slate-500">
                Don't have an account?{' '}
                <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-bold hover:underline">
                  Create Account →
                </Link>
              </p>
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 mt-5">
            {['🔒 Secure', '⚡ Instant Access', '🌐 100% Free'].map(b => (
              <span key={b} className="text-xs text-slate-400 font-medium">{b}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
