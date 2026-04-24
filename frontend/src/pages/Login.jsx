import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Mail, Lock, AlertCircle, Activity, ShieldCheck, Stethoscope, User } from 'lucide-react';

const DEMO_USERS = [
  {
    role: 'Admin',
    email: 'admin@test.com',
    password: '123456',
    icon: ShieldCheck,
    color: 'violet',
    desc: 'Manage users, appointments & system',
  },
  {
    role: 'Doctor',
    email: 'doctor@test.com',
    password: '123456',
    icon: Stethoscope,
    color: 'emerald',
    desc: 'View & manage patient appointments',
  },
  {
    role: 'Customer',
    email: 'customer@test.com',
    password: '123456',
    icon: User,
    color: 'blue',
    desc: 'Book appointments & view history',
  },
];

const colorMap = {
  violet: {
    card: 'border-violet-200 hover:border-violet-400 hover:bg-violet-50',
    icon: 'bg-violet-100 text-violet-600',
    badge: 'bg-violet-100 text-violet-700',
    btn: 'text-violet-600 hover:text-violet-800',
  },
  emerald: {
    card: 'border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50',
    icon: 'bg-emerald-100 text-emerald-600',
    badge: 'bg-emerald-100 text-emerald-700',
    btn: 'text-emerald-600 hover:text-emerald-800',
  },
  blue: {
    card: 'border-blue-200 hover:border-blue-400 hover:bg-blue-50',
    icon: 'bg-blue-100 text-blue-600',
    badge: 'bg-blue-100 text-blue-700',
    btn: 'text-blue-600 hover:text-blue-800',
  },
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      window.location.href = `/${data.role}`;
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const fillAndLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email: demoEmail, password: demoPassword });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      window.location.href = `/${data.role}`;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-6 items-start">

        {/* Left — Branding + Demo Cards */}
        <div className="space-y-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-3 rounded-2xl">
              <Activity size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">DentalCare</h1>
              <p className="text-blue-300 text-sm">Clinic Management System</p>
            </div>
          </div>

          <p className="text-slate-400 text-sm leading-relaxed">
            A complete solution to manage your dental clinic — appointments, doctors, patients, and revenue tracking.
          </p>

          {/* Demo Credentials */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
              🚀 Quick Login — Click any role to sign in instantly
            </p>
            <div className="space-y-3">
              {DEMO_USERS.map(({ role, email: dEmail, password: dPass, icon: Icon, color, desc }) => {
                const c = colorMap[color];
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => fillAndLogin(dEmail, dPass)}
                    disabled={loading}
                    className={`w-full flex items-center gap-4 p-4 bg-white/5 border rounded-xl text-left transition-all group disabled:opacity-60 ${c.card}`}
                  >
                    <div className={`p-2.5 rounded-xl ${c.icon} flex-shrink-0`}>
                      <Icon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-semibold text-white text-sm">{role}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.badge}`}>{role}</span>
                      </div>
                      <p className="text-xs text-slate-400 truncate">{dEmail}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                    </div>
                    <div className={`text-xs font-mono ${c.btn} hidden sm:block flex-shrink-0`}>
                      {dPass}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right — Login Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="mb-7">
            <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
            <p className="text-slate-500 text-sm mt-1">Sign in to your account to continue</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-5 flex items-center gap-2 text-sm">
              <AlertCircle size={17} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              id="login-submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Signing in...
                </span>
              ) : 'Sign In →'}
            </button>

            <div className="relative mt-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                setError('');
                setLoading(true);
                try {
                  const { data } = await api.post('/auth/opencode', {
                    providerToken: 'demo-opencode-token',
                    email: 'opencode@dentalcare.com',
                    name: 'Opencode User',
                    role: 'customer'
                  });
                  localStorage.setItem('token', data.token);
                  localStorage.setItem('user', JSON.stringify(data));
                  window.location.href = `/${data.role}`;
                } catch (err) {
                  setError('Opencode Auth failed');
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-xl transition-colors shadow-sm disabled:opacity-70"
            >
              <Activity size={18} />
              Login with Opencode Auth
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
              Don't have an account?{' '}
              <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
