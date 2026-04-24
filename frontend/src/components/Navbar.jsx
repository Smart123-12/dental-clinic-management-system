import { Menu, Activity, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ onMenuClick }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload();
  };

  const roleLabel = {
    admin: '🛡️ Admin',
    doctor: '🩺 Doctor',
    customer: '👤 Patient',
  };

  const roleBadgeColor = {
    admin: 'bg-violet-100 text-violet-700',
    doctor: 'bg-emerald-100 text-emerald-700',
    customer: 'bg-blue-100 text-blue-700',
  };

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm h-16 flex items-center px-4 gap-4 flex-shrink-0">
      {/* Mobile menu toggle */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
        aria-label="Open menu"
      >
        <Menu size={22} />
      </button>

      {/* Logo — shown on mobile only (sidebar hides on desktop) */}
      <div className="flex items-center gap-2 lg:hidden">
        <Activity size={20} className="text-blue-600" />
        <span className="font-bold text-slate-900">DentalCare</span>
      </div>

      <div className="flex-1" />

      {/* Role Badge */}
      {user && (
        <span className={`hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${roleBadgeColor[user.role]}`}>
          {roleLabel[user.role]}
        </span>
      )}

      {/* User name */}
      {user && (
        <span className="text-sm text-slate-600 hidden sm:inline">
          {user.name}
        </span>
      )}

      {/* Logout */}
      {user && (
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      )}
    </header>
  );
}
