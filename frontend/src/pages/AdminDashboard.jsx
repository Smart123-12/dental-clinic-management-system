import { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Users, Activity, DollarSign, Calendar,
  Plus, Trash2, X, UserCheck, UserX, Stethoscope, ShieldCheck,
  FileText, Box
} from 'lucide-react';

const ROLES = ['customer', 'doctor', 'admin'];

const roleBadge = {
  admin: 'bg-violet-100 text-violet-800',
  doctor: 'bg-blue-100 text-blue-800',
  customer: 'bg-slate-100 text-slate-700',
};

const statusBadge = {
  pending:   'bg-yellow-100 text-yellow-800',
  approved:  'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  rejected:  'bg-red-100 text-red-800',
};

const emptyForm = {
  name: '', email: '', password: '', role: 'customer',
  specialization: '', chargePerVisit: '',
};

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, apptsRes] = await Promise.all([
        api.get('/users'),
        api.get('/appointments'),
      ]);
      setUsers(usersRes.data);
      setAppointments(apptsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers(prev => prev.filter(u => u._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting user');
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    try {
      const payload = { ...form };
      if (form.role !== 'doctor') {
        delete payload.specialization;
        delete payload.chargePerVisit;
      }
      if (form.chargePerVisit) payload.chargePerVisit = Number(form.chargePerVisit);
      await api.post('/users', payload);
      await fetchData();
      setShowAddUser(false);
      setForm(emptyForm);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error creating user');
    } finally {
      setFormLoading(false);
    }
  };

  const handleAppointmentStatus = async (id, status) => {
    try {
      await api.put(`/appointments/${id}/status`, { status });
      fetchData();
    } catch (err) {
      alert('Error updating appointment');
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-100 border-t-blue-600" />
      <p className="text-slate-400 text-sm font-medium animate-pulse">Loading dashboard...</p>
    </div>
  );

  const totalRevenue = appointments.reduce((s, a) => s + (a.charges || 0), 0);
  const totalDoctors = users.filter(u => u.role === 'doctor').length;
  const totalPatients = users.filter(u => u.role === 'customer').length;
  const pendingCount = appointments.filter(a => a.status === 'pending').length;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'reports', label: 'Reports & Billing', icon: FileText },
    { id: 'inventory', label: 'Inventory', icon: Box },
  ];

  return (
    <div className="animate-fade-up">
      <div className="mb-7 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Welcome back — here's your clinic overview</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-bold">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          System Online
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit mb-7 border border-slate-200">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === id
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
            }`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* ──── OVERVIEW ──── */}
      {tab === 'overview' && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Patients', value: totalPatients, icon: Users, gradient: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50', text: 'text-blue-600' },
              { label: 'Total Doctors',  value: totalDoctors,  icon: Stethoscope, gradient: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50', text: 'text-emerald-600' },
              { label: 'Total Revenue',  value: `₹${totalRevenue.toLocaleString()}`, icon: DollarSign, gradient: 'from-violet-500 to-purple-500', bg: 'bg-violet-50', text: 'text-violet-600' },
              { label: 'Pending Appts', value: pendingCount, icon: Calendar, gradient: 'from-orange-400 to-amber-500', bg: 'bg-orange-50', text: 'text-orange-600' },
            ].map(({ label, value, icon: Icon, gradient, bg, text }, i) => (
              <div key={label} className={`stat-card animate-fade-up delay-${(i+1)*100}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`bg-gradient-to-br ${gradient} p-2.5 rounded-xl shadow-sm`}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">{label}</p>
                </div>
                <p className="text-3xl font-black text-slate-900">{value}</p>
              </div>
            ))}
          </div>

          {/* Recent Appointments */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="font-semibold text-slate-800">Recent Appointments</h2>
              <button onClick={() => setTab('appointments')} className="text-xs text-blue-600 hover:underline">View all →</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <tr>
                    {['Patient', 'Doctor', 'Date', 'Problem', 'Status'].map(h => (
                      <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {appointments.slice(0, 8).map(appt => (
                    <tr key={appt._id} className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-medium">{appt.patient?.name}</td>
                      <td className="px-5 py-3 text-slate-600">Dr. {appt.doctor?.name}</td>
                      <td className="px-5 py-3 text-slate-500">{new Date(appt.date).toLocaleDateString('en-IN')}</td>
                      <td className="px-5 py-3 text-slate-600">{appt.problem}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${statusBadge[appt.status]}`}>
                          {appt.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {appointments.length === 0 && (
                    <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-400">No appointments yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ──── USERS ──── */}
      {tab === 'users' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-slate-500 text-sm">{users.length} registered users</p>
            <button
              onClick={() => { setShowAddUser(true); setForm(emptyForm); setFormError(''); }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              <Plus size={16} /> Add User
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <tr>
                    {['Name', 'Email', 'Role', 'Specialization', 'Actions'].map(h => (
                      <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map(user => (
                    <tr key={user._id} className="hover:bg-slate-50 group">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold
                            ${user.role === 'admin' ? 'bg-violet-100 text-violet-700' :
                              user.role === 'doctor' ? 'bg-blue-100 text-blue-700' :
                              'bg-slate-100 text-slate-600'}`}>
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-slate-900">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-slate-500">{user.email}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${roleBadge[user.role]}`}>
                          {user.role === 'admin' && <ShieldCheck size={10} className="inline mr-1" />}
                          {user.role === 'doctor' && <Stethoscope size={10} className="inline mr-1" />}
                          {user.role}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-500">{user.specialization || '—'}</td>
                      <td className="px-5 py-3">
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => handleDeleteUser(user._id, user.name)}
                            className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all p-1 rounded hover:bg-red-50"
                            title="Delete user"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-400">No users found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ──── APPOINTMENTS ──── */}
      {tab === 'appointments' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">All Appointments ({appointments.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  {['Patient', 'Doctor', 'Date & Time', 'Problem', 'Status', 'Charges', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map(appt => (
                  <tr key={appt._id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium">{appt.patient?.name}</td>
                    <td className="px-5 py-3 text-slate-600">Dr. {appt.doctor?.name}</td>
                    <td className="px-5 py-3 text-slate-500 whitespace-nowrap">
                      {new Date(appt.date).toLocaleDateString('en-IN')}
                      <br/><span className="text-xs text-slate-400">{appt.timeSlot}</span>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{appt.problem}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${statusBadge[appt.status]}`}>
                        {appt.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-700">{appt.charges ? `₹${appt.charges}` : '—'}</td>
                    <td className="px-5 py-3">
                      {appt.status === 'pending' && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleAppointmentStatus(appt._id, 'approved')}
                            className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Approve"
                          >
                            <UserCheck size={15} />
                          </button>
                          <button
                            onClick={() => handleAppointmentStatus(appt._id, 'cancelled')}
                            className="p-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                            title="Cancel"
                          >
                            <UserX size={15} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {appointments.length === 0 && (
                  <tr><td colSpan={7} className="px-5 py-8 text-center text-slate-400">No appointments found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ──── REPORTS & BILLING ──── */}
      {tab === 'reports' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
            <FileText size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Reports & Billing Module</h2>
          <p className="text-slate-500 max-w-md mx-auto">
            This module provides comprehensive financial reports, invoice generation, and revenue analytics. 
            Currently in development. Total revenue recorded to date: <strong className="text-slate-800">₹{totalRevenue.toLocaleString()}</strong>.
          </p>
        </div>
      )}

      {/* ──── INVENTORY CONTROL ──── */}
      {tab === 'inventory' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4">
            <Box size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Inventory Control System</h2>
          <p className="text-slate-500 max-w-md mx-auto">
            Manage dental supplies, tools, and medications. Setup alerts for low stock and track vendor orders.
            Currently in development.
          </p>
        </div>
      )}

      {/* ──── ADD USER MODAL ──── */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-lg">Add New User</h3>
              <button onClick={() => setShowAddUser(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-200">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                  <input
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Dr. John Doe"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                  <input
                    required type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="user@dentalcare.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Password *</label>
                  <input
                    required minLength={6}
                    type="password"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Min 6 chars"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Role *</label>
                  <select
                    value={form.role}
                    onChange={e => setForm({ ...form, role: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {ROLES.map(r => <option key={r} value={r} className="capitalize">{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                  </select>
                </div>

                {form.role === 'doctor' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Specialization</label>
                      <input
                        value={form.specialization}
                        onChange={e => setForm({ ...form, specialization: e.target.value })}
                        className="w-full border border-slate-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Orthodontist"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Charge/Visit (₹)</label>
                      <input
                        type="number" min="0"
                        value={form.chargePerVisit}
                        onChange={e => setForm({ ...form, chargePerVisit: e.target.value })}
                        className="w-full border border-slate-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="500"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUser(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-70"
                >
                  {formLoading ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
