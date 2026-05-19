import { Menu, Activity, LogOut, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ onMenuClick }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const roleConfig = {
    admin:    { label: '🛡️ Admin',   cls: 'bg-violet-100 text-violet-700 border-violet-200' },
    doctor:   { label: '🩺 Doctor',  cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    customer: { label: '👤 Patient', cls: 'bg-blue-100 text-blue-700 border-blue-200' },
  };

  const rc = user ? (roleConfig[user.role] || roleConfig.customer) : null;

  const avatarGradient = {
    admin:    'from-violet-500 to-purple-600',
    doctor:   'from-emerald-500 to-teal-600',
    customer: 'from-blue-500 to-cyan-600',
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/70 shadow-sm h-16 flex items-center px-4 gap-4 flex-shrink-0 sticky top-0 z-20">
      {/* Mobile menu toggle */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
        aria-label="Open menu"
      >
        <Menu size={22} />
      </button>

      {/* Logo — mobile only */}
      <div className="flex items-center gap-2 lg:hidden">
        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-1.5 rounded-lg">
          <Activity size={16} className="text-white" />
        </div>
        <span className="font-black text-slate-900 tracking-tight">
          Dental<span className="text-blue-600">Care</span>
        </span>
      </div>

      <div className="flex-1" />

      {/* Role Badge */}
      {rc && (
        <span className={`hidden sm:inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border ${rc.cls}`}>
          {rc.label}
        </span>
      )}

      {/* Notification bell (decorative) */}
      <button className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors relative">
        <Bell size={18} />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full border border-white" />
      </button>

      {/* Avatar + name */}
      {user && (
        <div className="flex items-center gap-3">
          <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${avatarGradient[user.role] || avatarGradient.customer} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-semibold text-slate-700 hidden md:inline">
            {user.name}
          </span>
        </div>
      )}

      {/* Logout */}
      {user && (
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-slate-500 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-xl text-sm font-medium transition-all border border-transparent hover:border-red-100"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      )}
    </header>
  );
}
