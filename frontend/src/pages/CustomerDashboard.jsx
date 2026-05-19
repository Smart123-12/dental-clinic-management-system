import { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Calendar, Clock, Activity, Plus, X, CheckCircle,
  AlertCircle, XCircle, IndianRupee, Stethoscope,
  Star, TrendingUp, Heart, FileText, ChevronRight, Sparkles
} from 'lucide-react';

const statusBadge = {
  pending:   { cls: 'bg-yellow-100 text-yellow-800 border-yellow-200',    icon: AlertCircle,  label: 'Pending' },
  approved:  { cls: 'bg-blue-100 text-blue-800 border-blue-200',          icon: CheckCircle,  label: 'Approved' },
  completed: { cls: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle,  label: 'Completed' },
  cancelled: { cls: 'bg-red-100 text-red-700 border-red-200',             icon: XCircle,      label: 'Cancelled' },
  rejected:  { cls: 'bg-red-100 text-red-700 border-red-200',             icon: XCircle,      label: 'Rejected' },
};

const PROBLEMS = ['Tooth Pain', 'Cleaning', 'Root Canal', 'Checkup', 'Whitening', 'Cavity Filling', 'Braces Consultation', 'Extraction', 'Other'];
const TIME_SLOTS = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];

const HEALTH_TIPS = [
  { icon: '🦷', tip: 'Brush twice a day for 2 minutes each time.' },
  { icon: '💧', tip: 'Drink plenty of water to keep your mouth moist.' },
  { icon: '🍎', tip: 'Eat crunchy fruits & vegetables to clean your teeth naturally.' },
  { icon: '🚫', tip: 'Avoid sugary drinks — they cause tooth decay.' },
  { icon: '🔄', tip: 'Replace your toothbrush every 3 months.' },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export default function CustomerDashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [booking, setBooking] = useState(false);
  const [success, setSuccess] = useState('');
  const [bookError, setBookError] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming');

  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({ doctorId: '', date: '', timeSlot: '', problem: 'Tooth Pain' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [docsRes, apptsRes] = await Promise.all([
        api.get('/users/doctors'),
        api.get('/appointments'),
      ]);
      setDoctors(docsRes.data);
      setAppointments(apptsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    setBookError('');
    setBooking(true);
    try {
      await api.post('/appointments', form);
      setSuccess('Appointment booked successfully! 🎉');
      setShowForm(false);
      setForm({ doctorId: '', date: '', timeSlot: '', problem: 'Tooth Pain' });
      fetchData();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setBookError(err.response?.data?.message || 'Error booking appointment');
    } finally {
      setBooking(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await api.delete(`/appointments/${id}`);
      fetchData();
    } catch (err) {
      alert('Error cancelling appointment');
    }
  };

  const selectedDoc = doctors.find(d => d._id === form.doctorId);
  const upcoming = appointments.filter(a => a.status === 'pending' || a.status === 'approved');
  const past = appointments.filter(a => ['completed', 'cancelled', 'rejected'].includes(a.status));
  const tipOfDay = HEALTH_TIPS[new Date().getDay() % HEALTH_TIPS.length];

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-100 border-t-blue-600" />
      <p className="text-slate-400 text-sm font-medium animate-pulse">Loading your dashboard...</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-up">

      {/* ── Welcome Banner ── */}
      <div className="relative bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 rounded-2xl p-6 text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-white/5 rounded-full translate-y-1/2" />
        <div className="relative">
          <p className="text-blue-100 text-sm font-medium">{getGreeting()},</p>
          <h1 className="text-2xl font-black mt-0.5">{user.name} 👋</h1>
          <p className="text-blue-100 text-sm mt-1">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <div className="flex gap-6 mt-4">
            <div>
              <p className="text-3xl font-black">{appointments.length}</p>
              <p className="text-blue-100 text-xs">Total Visits</p>
            </div>
            <div className="w-px bg-white/20" />
            <div>
              <p className="text-3xl font-black">{upcoming.length}</p>
              <p className="text-blue-100 text-xs">Upcoming</p>
            </div>
            <div className="w-px bg-white/20" />
            <div>
              <p className="text-3xl font-black">{past.filter(a => a.status === 'completed').length}</p>
              <p className="text-blue-100 text-xs">Completed</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => { setShowForm(true); setBookError(''); }}
          className="absolute right-6 top-1/2 -translate-y-1/2 bg-white text-blue-600 font-bold px-5 py-2.5 rounded-xl text-sm shadow-lg hover:shadow-xl hover:-translate-y-[calc(50%+2px)] transition-all flex items-center gap-2"
        >
          <Plus size={16} /> Book Appointment
        </button>
      </div>

      {/* ── Success Toast ── */}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-5 py-3 rounded-xl flex items-center gap-3 text-sm animate-fade-in shadow-sm">
          <CheckCircle size={18} /> {success}
        </div>
      )}

      {/* ── Health Tip of the Day ── */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-center gap-4">
        <div className="text-3xl animate-float">{tipOfDay.icon}</div>
        <div>
          <p className="text-xs font-bold text-amber-600 uppercase tracking-widest flex items-center gap-1">
            <Sparkles size={12} /> Health Tip of the Day
          </p>
          <p className="text-slate-700 text-sm mt-0.5 font-medium">{tipOfDay.tip}</p>
        </div>
      </div>

      {/* ── Quick Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Visits',  val: appointments.length, icon: Activity,     gradient: 'from-blue-500 to-cyan-500' },
          { label: 'Upcoming',      val: upcoming.length,     icon: Calendar,     gradient: 'from-violet-500 to-purple-500' },
          { label: 'Completed',     val: past.filter(a => a.status === 'completed').length, icon: CheckCircle, gradient: 'from-emerald-500 to-teal-500' },
          { label: 'Cancelled',     val: past.filter(a => ['cancelled','rejected'].includes(a.status)).length, icon: XCircle, gradient: 'from-red-400 to-rose-500' },
        ].map(({ label, val, icon: Icon, gradient }, i) => (
          <div key={label} className={`stat-card animate-fade-up delay-${(i+1)*100}`}>
            <div className={`bg-gradient-to-br ${gradient} w-10 h-10 rounded-xl flex items-center justify-center mb-3 shadow-sm`}>
              <Icon size={18} className="text-white" />
            </div>
            <p className="text-2xl font-black text-slate-900">{val}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Our Doctors ── */}
      {doctors.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-slate-900">Our Dentists</h2>
            <button
              onClick={() => { setShowForm(true); setBookError(''); }}
              className="text-xs text-blue-600 font-bold flex items-center gap-1 hover:underline"
            >
              Book Now <ChevronRight size={14} />
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {doctors.map(doc => (
              <div key={doc._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md hover:-translate-y-1 transition-all group">
                <div className="flex items-start gap-4">
                  <div className="bg-gradient-to-br from-blue-500 to-cyan-500 h-14 w-14 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-sm flex-shrink-0">
                    {doc.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900">Dr. {doc.name}</p>
                    <p className="text-xs text-blue-600 font-semibold mt-0.5">{doc.specialization || 'General Dentist'}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} size={11} className="fill-amber-400 text-amber-400" />
                      ))}
                      <span className="text-xs text-slate-400 ml-1">5.0</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1 text-slate-700 text-sm">
                    <IndianRupee size={13} />
                    <span className="font-bold">{doc.chargePerVisit || 0}</span>
                    <span className="text-slate-400 text-xs">/visit</span>
                  </div>
                  <button
                    onClick={() => { setForm(f => ({ ...f, doctorId: doc._id })); setShowForm(true); setBookError(''); }}
                    className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center gap-1"
                  >
                    <Plus size={12} /> Book
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Appointments Tabs ── */}
      <div>
        <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 w-fit mb-5 border border-slate-200">
          {[
            { id: 'upcoming', label: `Upcoming (${upcoming.length})` },
            { id: 'history',  label: `History (${past.length})` },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === t.id
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Upcoming */}
        {activeTab === 'upcoming' && (
          upcoming.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 py-16 text-center">
              <Calendar size={44} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-500 font-bold">No upcoming appointments</p>
              <p className="text-slate-400 text-sm mt-1">Book your next visit to get started</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-5 btn-primary text-sm px-6 py-2.5 inline-block"
              >
                Book Now
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.map(appt => {
                const badge = statusBadge[appt.status];
                const BadgeIcon = badge.icon;
                return (
                  <div key={appt._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                          {appt.doctor?.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">Dr. {appt.doctor?.name}</p>
                          <p className="text-xs text-slate-400">{appt.doctor?.specialization}</p>
                        </div>
                      </div>
                      <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${badge.cls}`}>
                        <BadgeIcon size={11} /> {badge.label}
                      </span>
                    </div>
                    <div className="space-y-2 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Calendar size={13} className="text-slate-400" />
                        {new Date(appt.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={13} className="text-slate-400" /> {appt.timeSlot}
                      </div>
                      <div className="flex items-center gap-2">
                        <Activity size={13} className="text-slate-400" /> {appt.problem}
                      </div>
                    </div>
                    <button
                      onClick={() => handleCancel(appt._id)}
                      className="mt-4 w-full text-xs text-red-500 hover:text-red-700 font-semibold hover:bg-red-50 py-2 rounded-lg transition-colors border border-transparent hover:border-red-100"
                    >
                      Cancel Appointment
                    </button>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* History */}
        {activeTab === 'history' && (
          past.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 py-16 text-center">
              <FileText size={44} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-500 font-bold">No appointment history yet</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {['Doctor', 'Date', 'Time', 'Problem', 'Status', 'Charges'].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {past.map(appt => {
                    const badge = statusBadge[appt.status];
                    return (
                      <tr key={appt._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-4 font-semibold text-slate-900">Dr. {appt.doctor?.name}</td>
                        <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                          {new Date(appt.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-5 py-4 text-slate-500 whitespace-nowrap">{appt.timeSlot}</td>
                        <td className="px-5 py-4 text-slate-600">{appt.problem}</td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${badge.cls}`}>{badge.label}</span>
                        </td>
                        <td className="px-5 py-4 text-slate-700 font-semibold">
                          {appt.charges ? (
                            <span className="flex items-center gap-0.5"><IndianRupee size={12} />{appt.charges}</span>
                          ) : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {/* ── Book Appointment Modal ── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4 modal-backdrop">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[92vh] overflow-y-auto modal-content">
            <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 sticky top-0 bg-white rounded-t-3xl z-10">
              <div>
                <h3 className="font-black text-slate-900 text-lg">Book Appointment</h3>
                <p className="text-xs text-slate-500 mt-0.5">Select your doctor & preferred time</p>
              </div>
              <button onClick={() => { setShowForm(false); setBookError(''); }}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleBook} className="p-6 space-y-5">
              {bookError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                  <AlertCircle size={16} /> {bookError}
                </div>
              )}

              {/* Doctor */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Select Doctor *</label>
                <select
                  required value={form.doctorId}
                  onChange={e => setForm({ ...form, doctorId: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl py-3 px-4 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">— Choose a doctor —</option>
                  {doctors.map(doc => (
                    <option key={doc._id} value={doc._id}>
                      Dr. {doc.name} ({doc.specialization || 'General'}) — ₹{doc.chargePerVisit || 0}/visit
                    </option>
                  ))}
                </select>
                {selectedDoc && (
                  <div className="mt-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-center gap-3">
                    <div className="bg-gradient-to-br from-blue-500 to-cyan-500 h-9 w-9 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      {selectedDoc.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Dr. {selectedDoc.name}</p>
                      <p className="text-xs text-blue-600">{selectedDoc.specialization} · ₹{selectedDoc.chargePerVisit}/visit</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Problem */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Dental Problem *</label>
                <select
                  value={form.problem}
                  onChange={e => setForm({ ...form, problem: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl py-3 px-4 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {PROBLEMS.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Preferred Date *</label>
                <input
                  type="date" required min={today} value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl py-3 px-4 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Time Slots */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Time Slot *</label>
                <div className="grid grid-cols-4 gap-2">
                  {TIME_SLOTS.map(slot => (
                    <button
                      key={slot} type="button"
                      onClick={() => setForm({ ...form, timeSlot: slot })}
                      className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                        form.timeSlot === slot
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
                {!form.timeSlot && <p className="text-xs text-slate-400 mt-1.5">Please select a time slot</p>}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowForm(false); setBookError(''); }}
                  className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={booking || !form.timeSlot}
                  className="flex-1 btn-primary py-3 rounded-xl text-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none">
                  {booking ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      Booking...
                    </span>
                  ) : 'Confirm Booking ✓'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
