import { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Calendar, User, Clock, CheckCircle, XCircle,
  AlertCircle, ClipboardList, IndianRupee, Activity, X
} from 'lucide-react';

const statusBadge = {
  pending:   'bg-yellow-100 text-yellow-800',
  approved:  'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-700',
  rejected:  'bg-red-100 text-red-700',
};

const ALL_SLOTS = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];

export default function DoctorDashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('appointments'); // 'appointments' | 'slots'
  const [filter, setFilter] = useState('all');

  // Completion modal
  const [editingAppt, setEditingAppt] = useState(null);
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [charges, setCharges] = useState('');
  const [saving, setSaving] = useState(false);

  // Reschedule modal
  const [rescheduleAppt, setRescheduleAppt] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newSlot, setNewSlot] = useState('');
  const [rescheduling, setRescheduling] = useState(false);

  // Slots
  const [mySlots, setMySlots] = useState([]);
  const [savingSlots, setSavingSlots] = useState(false);

  useEffect(() => {
    fetchAppointments();
    fetchProfile();
  }, []);

  const fetchAppointments = async () => {
    try {
      const { data } = await api.get('/appointments');
      setAppointments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/users/me');
      setMySlots(data.availableSlots || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/appointments/${id}/status`, { status });
      fetchAppointments();
    } catch (err) {
      alert('Error updating status');
    }
  };

  const handleComplete = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/appointments/${editingAppt._id}/status`, {
        status: 'completed',
        treatmentPlan,
        charges: Number(charges),
      });
      setEditingAppt(null);
      fetchAppointments();
    } catch (err) {
      alert('Error saving treatment plan');
    } finally {
      setSaving(false);
    }
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    setRescheduling(true);
    try {
      await api.put(`/appointments/${rescheduleAppt._id}/status`, {
        date: newDate,
        timeSlot: newSlot,
        status: 'approved' // Auto approve on reschedule
      });
      setRescheduleAppt(null);
      fetchAppointments();
    } catch (err) {
      alert('Error rescheduling');
    } finally {
      setRescheduling(false);
    }
  };

  const toggleSlot = (slot) => {
    if (mySlots.includes(slot)) {
      setMySlots(mySlots.filter(s => s !== slot));
    } else {
      setMySlots([...mySlots, slot]);
    }
  };

  const saveSlots = async () => {
    setSavingSlots(true);
    try {
      await api.put('/users/myslots/update', { slots: mySlots });
      alert('Slots updated successfully!');
    } catch (err) {
      alert('Error saving slots');
    } finally {
      setSavingSlots(false);
    }
  };

  const filtered = filter === 'all'
    ? appointments
    : appointments.filter(a => a.status === filter);

  const counts = {
    all: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    approved: appointments.filter(a => a.status === 'approved').length,
    completed: appointments.filter(a => a.status === 'completed').length,
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-500 border-t-transparent" />
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Doctor Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Welcome back, Dr. {user.name} 👋</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-200 rounded-xl p-1 w-fit mb-6">
        <button
          onClick={() => setTab('appointments')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'appointments' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ClipboardList size={15} /> Appointments
        </button>
        <button
          onClick={() => setTab('slots')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'slots' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock size={15} /> Manage Slots
        </button>
      </div>

      {tab === 'slots' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 max-w-2xl">
          <h2 className="text-lg font-bold text-slate-900 mb-2">Available Time Slots</h2>
          <p className="text-slate-500 text-sm mb-6">Select the slots you are available for patient appointments.</p>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {ALL_SLOTS.map(slot => {
              const isSelected = mySlots.includes(slot);
              return (
                <button
                  key={slot}
                  onClick={() => toggleSlot(slot)}
                  className={`py-3 rounded-xl text-sm font-semibold border transition-all ${
                    isSelected 
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                      : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-200 hover:bg-emerald-50'
                  }`}
                >
                  {slot}
                </button>
              );
            })}
          </div>

          <button
            onClick={saveSlots}
            disabled={savingSlots}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-70"
          >
            {savingSlots ? 'Saving...' : 'Save Availability'}
          </button>
        </div>
      )}

      {tab === 'appointments' && (
        <>
          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total', count: counts.all, color: 'slate', icon: ClipboardList },
              { label: 'Pending', count: counts.pending, color: 'yellow', icon: AlertCircle },
              { label: 'Approved', count: counts.approved, color: 'blue', icon: CheckCircle },
              { label: 'Completed', count: counts.completed, color: 'emerald', icon: CheckCircle },
            ].map(({ label, count, color, icon: Icon }) => (
              <div key={label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3">
                <div className={`bg-${color}-100 p-2.5 rounded-xl text-${color}-600`}>
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="text-xl font-bold text-slate-900">{count}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {['all', 'pending', 'approved', 'completed', 'cancelled'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all border ${
                  filter === f
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                }`}
              >
                {f} {f === 'all' ? `(${counts.all})` : f === 'pending' ? `(${counts.pending})` : ''}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <tr>
                    {['Patient', 'Date & Time', 'Problem', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-5 py-3 text-left font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map(appt => (
                    <tr key={appt._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-xs font-bold">
                            {appt.patient?.name?.charAt(0).toUpperCase() || 'P'}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{appt.patient?.name || 'Unknown Patient'}</p>
                            <p className="text-xs text-slate-400">{appt.patient?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Calendar size={14} className="text-slate-400" />
                          {new Date(appt.date).toLocaleDateString('en-IN')}
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-1">
                          <Clock size={12} />
                          {appt.timeSlot}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-600">{appt.problem}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusBadge[appt.status]}`}>
                          {appt.status}
                        </span>
                        {appt.charges > 0 && (
                          <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                            <IndianRupee size={11} />{appt.charges}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2 flex-wrap">
                          {appt.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(appt._id, 'approved')}
                                className="flex items-center gap-1.5 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold px-3 py-1.5 rounded-lg transition-colors"
                              >
                                <CheckCircle size={13} /> Approve
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(appt._id, 'rejected')}
                                className="flex items-center gap-1.5 text-xs bg-red-50 hover:bg-red-100 text-red-600 font-semibold px-3 py-1.5 rounded-lg transition-colors"
                              >
                                <XCircle size={13} /> Reject
                              </button>
                            </>
                          )}
                          {(appt.status === 'pending' || appt.status === 'approved') && (
                            <button
                              onClick={() => {
                                setRescheduleAppt(appt);
                                setNewDate(new Date(appt.date).toISOString().split('T')[0]);
                                setNewSlot(appt.timeSlot);
                              }}
                              className="flex items-center gap-1.5 text-xs bg-orange-50 hover:bg-orange-100 text-orange-700 font-semibold px-3 py-1.5 rounded-lg transition-colors"
                            >
                              <Clock size={13} /> Reschedule
                            </button>
                          )}
                          {appt.status === 'approved' && (
                            <button
                              onClick={() => {
                                setEditingAppt(appt);
                                setTreatmentPlan(appt.treatmentPlan || '');
                                setCharges(appt.charges || '');
                              }}
                              className="flex items-center gap-1.5 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold px-3 py-1.5 rounded-lg transition-colors"
                            >
                              <CheckCircle size={13} /> Mark Complete
                            </button>
                          )}
                          {appt.status === 'completed' && appt.treatmentPlan && (
                            <span className="text-xs text-slate-400 italic max-w-[160px] truncate" title={appt.treatmentPlan}>
                              📋 {appt.treatmentPlan.slice(0, 30)}...
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center">
                        <ClipboardList size={36} className="mx-auto text-slate-300 mb-3" />
                        <p className="text-slate-400 font-medium">No appointments found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Complete Appointment Modal */}
      {editingAppt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-lg">Complete Appointment</h3>
              <p className="text-sm text-slate-500 mt-0.5">Patient: {editingAppt.patient?.name}</p>
            </div>
            <form onSubmit={handleComplete} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Treatment Plan / Notes *
                </label>
                <textarea
                  required rows={4}
                  value={treatmentPlan}
                  onChange={e => setTreatmentPlan(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  placeholder="Describe the treatment done, medications prescribed, follow-up instructions..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Total Charges (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                  <input
                    type="number" required min="0"
                    value={charges}
                    onChange={e => setCharges(e.target.value)}
                    className="w-full pl-7 border border-slate-300 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingAppt(null)}
                  className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-70"
                >
                  {saving ? 'Saving...' : '✓ Complete Visit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleAppt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Reschedule Appointment</h3>
                <p className="text-sm text-slate-500 mt-0.5">Patient: {rescheduleAppt.patient?.name}</p>
              </div>
              <button onClick={() => setRescheduleAppt(null)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleReschedule} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">New Date *</label>
                <input
                  type="date" required
                  min={new Date().toISOString().split('T')[0]}
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">New Time Slot *</label>
                <div className="grid grid-cols-3 gap-2">
                  {mySlots.length > 0 ? mySlots.map(slot => (
                    <button
                      key={slot} type="button"
                      onClick={() => setNewSlot(slot)}
                      className={`py-2 rounded-lg text-xs font-medium border transition-all ${
                        newSlot === slot
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400'
                      }`}
                    >
                      {slot}
                    </button>
                  )) : (
                    <p className="col-span-3 text-sm text-slate-500">You have no available slots set.</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setRescheduleAppt(null)}
                  className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rescheduling || !newSlot}
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-70"
                >
                  {rescheduling ? 'Saving...' : 'Reschedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
