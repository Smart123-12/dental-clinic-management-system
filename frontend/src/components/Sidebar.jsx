import { NavLink, useNavigate } from 'react-router-dom';
import {
  Activity, LayoutDashboard, Calendar, History,
  Users, LogOut, X, Stethoscope, ShieldCheck, UserCircle,
  ClipboardList
} from 'lucide-react';

const navConfig = {
  customer: [
    { to: '/customer', label: 'My Dashboard', icon: LayoutDashboard },
  ],
  doctor: [
    { to: '/doctor', label: 'Appointments', icon: ClipboardList },
  ],
  admin: [
    { to: '/admin', label: 'Overview',      icon: LayoutDashboard },
    { to: '/admin', label: 'Users',         icon: Users, tab: 'users' },
    { to: '/admin', label: 'Appointments',  icon: Calendar, tab: 'appointments' },
  ],
};

const roleConfig = {
  customer: {
    gradient: 'from-blue-600 to-blue-700',
    label: 'Patient Portal',
    icon: UserCircle,
  },
  doctor: {
    gradient: 'from-emerald-600 to-emerald-700',
    label: 'Doctor Portal',
    icon: Stethoscope,
  },
  admin: {
    gradient: 'from-violet-600 to-violet-700',
    label: 'Admin Panel',
    icon: ShieldCheck,
  },
};

export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user) return null;

  const links = navConfig[user.role] || [];
  const { gradient, label, icon: RoleIcon } = roleConfig[user.role] || roleConfig.customer;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload();
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 z-40 flex flex-col
        bg-slate-900 text-white shadow-2xl
        transition-transform duration-300 ease-out
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto lg:flex-shrink-0
      `}>

        {/* Header */}
        <div className={`bg-gradient-to-br ${gradient} px-5 py-5 flex items-center justify-between flex-shrink-0`}>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <Activity size={20} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-base leading-tight">DentalCare</div>
              <div className="text-xs text-white/70">{label}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* User Info */}
        <div className="px-4 py-4 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className={`bg-gradient-to-br ${gradient} h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0`}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <div className="font-semibold text-sm text-white truncate">{user.name}</div>
              <div className="text-xs text-slate-400 truncate">{user.email}</div>
            </div>
          </div>
          <div className={`mt-3 inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-white/10 text-white/80`}>
            <RoleIcon size={12} />
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {links.map(({ to, label: navLabel, icon: Icon }) => (
            <NavLink
              key={navLabel}
              to={to}
              end
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all group
                ${isActive
                  ? `bg-white/15 text-white shadow-sm sidebar-active`
                  : 'text-slate-400 hover:text-white hover:bg-white/8'
                }`
              }
            >
              <Icon size={18} />
              <span className="flex-1">{navLabel}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-6 flex-shrink-0">
          <div className="border-t border-slate-700/50 pt-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
