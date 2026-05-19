import { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Calendar, Clock, CheckCircle, XCircle, AlertCircle,
  ClipboardList, IndianRupee, TrendingUp, X, Users,
  Stethoscope, ChevronRight, Star, Activity
} from 'lucide-react';

const statusBadge = {
  pending:   'bg-yellow-100 text-yellow-800 border-yellow-200',
  approved:  'bg-blue-100 text-blue-800 border-blue-200',
  completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
  rejected:  'bg-red-100 text-red-700 border-red-200',
};

const ALL_SLOTS = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export default function DoctorDashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('appointments');
  const [filter, setFilter] = useState('all');

  const [editingAppt, setEditingAppt] = useState(null);
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [charges, setCharges] = useState('');
  const [saving, setSaving] = useState(false);

  const [rescheduleAppt, setRescheduleAppt] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newSlot, setNewSlot] = useState('');
  const [rescheduling, setRescheduling] = useState(false);

  const [mySlots, setMySlots] = useState([]);
  const [savingSlots, setSavingSlots] = useState(false);
  const [slotsSuccess, setSlotsSuccess] = useState(false);

  useEffect(() => { fetchAppointments(); fetchProfile(); }, []);

  const fetchAppointments = async () => {
    try {
      const { data } = await api.get('/appointments');
      setAppointments(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/users/me');
      setMySlots(data.availableSlots || []);
    } catch (err) { console.error(err); }
  };

  const handleStatusUpdate = async (id, status) => {
    try { await api.put(`/appointments/${id}/status`, { status }); fetchAppointments(); }
    catch { alert('Error updating status'); }
  };

  const handleComplete = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/appointments/${editingAppt._id}/status`, {
        status: 'completed', treatmentPlan, charges: Number(charges),
      });
      setEditingAppt(null);
      fetchAppointments();
    } catch { alert('Error saving treatment plan'); }
    finally { setSaving(false); }
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    setRescheduling(true);
    try {
      await api.put(`/appointments/${rescheduleAppt._id}/status`, {
        date: newDate, timeSlot: newSlot, status: 'approved',
      });
      setRescheduleAppt(null);
      fetchAppointments();
    } catch { alert('Error rescheduling'); }
    finally { setRescheduling(false); }
  };

  const saveSlots = async () => {
    setSavingSlots(true);
    try {
      await api.put('/users/myslots/update', { slots: mySlots });
      setSlotsSuccess(true);
      setTimeout(() => setSlotsSuccess(false), 3000);
    } catch { alert('Error saving slots'); }
    finally { setSavingSlots(false); }
  };

  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter);
  const counts = {
    all: appointments.length,
    pending:   appointments.filter(a => a.status === 'pending').length,
    approved:  appointments.filter(a => a.status === 'approved').length,
    completed: appointments.filter(a => a.status === 'completed').length,
  };
  const totalRevenue = appointments.filter(a => a.status === 'completed').reduce((s, a) => s + (a.charges || 0), 0);
  const todayAppts = appointments.filter(a => {
    const d = new Date(a.date).toDateString();
    return d === new Date().toDateString() && (a.status === 'approved' || a.status === 'pending');
  });

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-100 border-t-emerald-600" />
      <p className="text-slate-400 text-sm font-medium animate-pulse">Loading your dashboard...</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-up">

      {/* ── Welcome Banner ── */}
      <div className="relative bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400 rounded-2xl p-6 text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-white/5 rounded-full translate-y-1/2" />
        <div className="relative">
          <p className="text-emerald-100 text-sm font-medium">{getGreeting()},</p>
          <h1 className="text-2xl font-black mt-0.5">Dr. {user.name} 🩺</h1>
          <p className="text-emerald-100 text-sm mt-1">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <div className="flex gap-6 mt-4">
            <div><p className="text-3xl font-black">{counts.pending}</p><p className="text-emerald-100 text-xs">Pending</p></div>
            <div className="w-px bg-white/20" />
            <div><p className="text-3xl font-black">{todayAppts.length}</p><p className="text-emerald-100 text-xs">Today</p></div>
            <div className="w-px bg-white/20" />
            <div><p className="text-3xl font-black">₹{totalRevenue.toLocaleString()}</p><p className="text-emerald-100 text-xs">Revenue</p></div>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Patients', val: counts.all,       gradient: 'from-slate-600 to-slate-700', icon: Users },
          { label: 'Pending',        val: counts.pending,   gradient: 'from-yellow-500 to-amber-500', icon: AlertCircle },
          { label: 'Approved',       val: counts.approved,  gradient: 'from-blue-500 to-cyan-500',    icon: CheckCircle },
          { label: 'Revenue',        val: `₹${totalRevenue.toLocaleString()}`, gradient: 'from-emerald-500 to-teal-500', icon: IndianRupee },
        ].map(({ label, val, gradient, icon: Icon }, i) => (
          <div key={label} className={`stat-card animate-fade-up delay-${(i+1)*100}`}>
            <div className={`bg-gradient-to-br ${gradient} w-10 h-10 rounded-xl flex items-center justify-center mb-3 shadow-sm`}>
              <Icon size={18} className="text-white" />
            </div>
            <p className="text-2xl font-black text-slate-900">{val}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Today's Queue ── */}
      {todayAppts.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
            <h2 className="font-black text-slate-900">Today's Queue</h2>
            <span className="ml-auto text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-bold">{todayAppts.length} patients</span>
          </div>
          <div className="divide-y divide-slate-50">
            {todayAppts.map((appt, idx) => (
              <div key={appt._id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 text-xs font-black flex items-center justify-center flex-shrink-0">
                  {idx + 1}
                </div>
                <div className="h-9 w-9 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {appt.patient?.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 text-sm">{appt.patient?.name}</p>
                  <p className="text-xs text-slate-400">{appt.problem}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-700">{appt.timeSlot}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${statusBadge[appt.status]}`}>
                    {appt.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Main Tabs ── */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit border border-slate-200">
        {[
          { id: 'appointments', label: 'Appointments', icon: ClipboardList },
          { id: 'slots',        label: 'Manage Slots', icon: Clock },
        ].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all ${
              tab === id ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-800'
            }`}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* ── SLOTS TAB ── */}
      {tab === 'slots' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-2xl">
          <h2 className="text-lg font-black text-slate-900 mb-1">Available Time Slots</h2>
          <p className="text-slate-500 text-sm mb-6">Toggle the slots when you are available for appointments.</p>
          {slotsSuccess && (
            <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-fade-in">
              <CheckCircle size={16} /> Slots updated successfully!
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {ALL_SLOTS.map(slot => {
              const isSelected = mySlots.includes(slot);
              return (
                <button key={slot} onClick={() => setMySlots(isSelected ? mySlots.filter(s => s !== slot) : [...mySlots, slot])}
                  className={`py-3 rounded-xl text-xs font-bold border transition-all ${
                    isSelected
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white border-transparent shadow-md shadow-emerald-200'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50'
                  }`}>
                  {slot}
                </button>
              );
            })}
          </div>
          <button onClick={saveSlots} disabled={savingSlots}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-emerald-200 transition-all disabled:opacity-70">
            {savingSlots ? 'Saving...' : 'Save Availability ✓'}
          </button>
        </div>
      )}

      {/* ── APPOINTMENTS TAB ── */}
      {tab === 'appointments' && (
        <>
          {/* Filter pills */}
          <div className="flex gap-2 flex-wrap">
            {['all', 'pending', 'approved', 'completed', 'cancelled'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all border ${
                  filter === f ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                }`}>
                {f} {f === 'all' ? `(${counts.all})` : f === 'pending' ? `(${counts.pending})` : f === 'approved' ? `(${counts.approved})` : ''}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['Patient', 'Date & Time', 'Problem', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(appt => (
                  <tr key={appt._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white text-xs font-black">
                          {appt.patient?.name?.charAt(0).toUpperCase() || 'P'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{appt.patient?.name || 'Unknown'}</p>
                          <p className="text-xs text-slate-400">{appt.patient?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <p className="font-semibold text-slate-700">
                        {new Date(appt.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{appt.timeSlot}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{appt.problem}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusBadge[appt.status]}`}>
                        {appt.status}
                      </span>
                      {appt.charges > 0 && (
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-0.5">
                          <IndianRupee size={10} />{appt.charges}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-1.5 flex-wrap">
                        {appt.status === 'pending' && (
                          <>
                            <button onClick={() => handleStatusUpdate(appt._id, 'approved')}
                              className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                              <CheckCircle size={12} /> Approve
                            </button>
                            <button onClick={() => handleStatusUpdate(appt._id, 'rejected')}
                              className="text-xs bg-red-50 hover:bg-red-100 text-red-600 font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                              <XCircle size={12} /> Reject
                            </button>
                          </>
                        )}
                        {(appt.status === 'pending' || appt.status === 'approved') && (
                          <button onClick={() => { setRescheduleAppt(appt); setNewDate(new Date(appt.date).toISOString().split('T')[0]); setNewSlot(appt.timeSlot); }}
                            className="text-xs bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                            <Clock size={12} /> Reschedule
                          </button>
                        )}
                        {appt.status === 'approved' && (
                          <button onClick={() => { setEditingAppt(appt); setTreatmentPlan(appt.treatmentPlan || ''); setCharges(appt.charges || ''); }}
                            className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                            <CheckCircle size={12} /> Complete
                          </button>
                        )}
                        {appt.status === 'completed' && appt.treatmentPlan && (
                          <span className="text-xs text-slate-400 italic max-w-[140px] truncate" title={appt.treatmentPlan}>
                            📋 {appt.treatmentPlan.slice(0, 25)}...
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="px-5 py-14 text-center">
                    <ClipboardList size={36} className="mx-auto text-slate-200 mb-3" />
                    <p className="text-slate-400 font-semibold">No appointments found</p>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── Complete Modal ── */}
      {editingAppt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 modal-backdrop">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md modal-content">
            <div className="px-6 py-5 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-lg">Complete Visit</h3>
              <p className="text-sm text-slate-500 mt-0.5">Patient: <span className="font-bold text-slate-700">{editingAppt.patient?.name}</span></p>
            </div>
            <form onSubmit={handleComplete} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Treatment Plan / Notes *</label>
                <textarea required rows={4} value={treatmentPlan} onChange={e => setTreatmentPlan(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl py-3 px-4 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  placeholder="Describe treatment done, medications prescribed, follow-up..." />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Total Charges (₹) *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <input type="number" required min="0" value={charges} onChange={e => setCharges(e.target.value)}
                    className="w-full pl-8 border border-slate-200 rounded-xl py-3 px-4 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="0" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditingAppt(null)}
                  className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-sm font-bold py-3 shadow-md transition-all disabled:opacity-70">
                  {saving ? 'Saving...' : '✓ Mark as Completed'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Reschedule Modal ── */}
      {rescheduleAppt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 modal-backdrop">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md modal-content">
            <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100">
              <div>
                <h3 className="font-black text-slate-900 text-lg">Reschedule</h3>
                <p className="text-sm text-slate-500">Patient: <span className="font-bold text-slate-700">{rescheduleAppt.patient?.name}</span></p>
              </div>
              <button onClick={() => setRescheduleAppt(null)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-500"><X size={20} /></button>
            </div>
            <form onSubmit={handleReschedule} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">New Date *</label>
                <input type="date" required min={new Date().toISOString().split('T')[0]}
                  value={newDate} onChange={e => setNewDate(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl py-3 px-4 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">New Time Slot *</label>
                <div className="grid grid-cols-3 gap-2">
                  {(mySlots.length > 0 ? mySlots : ALL_SLOTS).map(slot => (
                    <button key={slot} type="button" onClick={() => setNewSlot(slot)}
                      className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                        newSlot === slot ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400'
                      }`}>
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setRescheduleAppt(null)}
                  className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" disabled={rescheduling || !newSlot}
                  className="flex-1 btn-primary py-3 rounded-xl text-sm disabled:opacity-70 disabled:transform-none disabled:cursor-not-allowed">
                  {rescheduling ? 'Saving...' : 'Reschedule ✓'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
