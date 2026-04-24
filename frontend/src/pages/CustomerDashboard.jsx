import { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Calendar, Clock, Activity, User as UserIcon,
  Plus, X, CheckCircle, AlertCircle, XCircle, IndianRupee, Stethoscope
} from 'lucide-react';

const statusBadge = {
  pending:   { cls: 'bg-yellow-100 text-yellow-800', icon: AlertCircle, label: 'Pending' },
  approved:  { cls: 'bg-blue-100 text-blue-800',    icon: CheckCircle, label: 'Approved' },
  completed: { cls: 'bg-green-100 text-green-800',  icon: CheckCircle, label: 'Completed' },
  cancelled: { cls: 'bg-red-100 text-red-700',      icon: XCircle,     label: 'Cancelled' },
  rejected:  { cls: 'bg-red-100 text-red-700',      icon: XCircle,     label: 'Rejected' },
};

const PROBLEMS = ['Tooth Pain', 'Cleaning', 'Root Canal', 'Checkup', 'Whitening', 'Cavity Filling', 'Braces Consultation', 'Extraction', 'Other'];
const TIME_SLOTS = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];

export default function CustomerDashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [booking, setBooking] = useState(false);
  const [success, setSuccess] = useState('');
  const [bookError, setBookError] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    doctorId: '', date: '', timeSlot: '', problem: 'Tooth Pain',
  });

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
      setTimeout(() => setSuccess(''), 4000);
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

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent" />
    </div>
  );

  const upcoming = appointments.filter(a => a.status === 'pending' || a.status === 'approved');
  const past = appointments.filter(a => a.status === 'completed' || a.status === 'cancelled' || a.status === 'rejected');

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Hello, {user.name} 👋 — book your next visit below</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setBookError(''); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm w-fit"
        >
          <Plus size={17} /> Book Appointment
        </button>
      </div>

      {/* Success toast */}
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
          <CheckCircle size={17} /> {success}
        </div>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Total Visits', value: appointments.length },
          { label: 'Upcoming', value: upcoming.length },
          { label: 'Completed', value: past.filter(a => a.status === 'completed').length },
          { label: 'Cancelled', value: past.filter(a => a.status === 'cancelled' || a.status === 'rejected').length },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Upcoming Appointments */}
      {upcoming.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">Upcoming Appointments</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map(appt => {
              const badge = statusBadge[appt.status];
              const BadgeIcon = badge.icon;
              return (
                <div key={appt._id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-xs font-bold">
                        {appt.doctor?.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">Dr. {appt.doctor?.name}</p>
                        <p className="text-xs text-slate-500">{appt.doctor?.specialization}</p>
                      </div>
                    </div>
                    <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${badge.cls}`}>
                      <BadgeIcon size={11} /> {badge.label}
                    </span>
                  </div>
                  <div className="flex gap-4 text-xs text-slate-600">
                    <span className="flex items-center gap-1"><Calendar size={13} />{new Date(appt.date).toLocaleDateString('en-IN')}</span>
                    <span className="flex items-center gap-1"><Clock size={13} />{appt.timeSlot}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Activity size={13} /> {appt.problem}
                  </div>
                  <button
                    onClick={() => handleCancel(appt._id)}
                    className="text-xs text-red-500 hover:text-red-700 font-medium hover:underline text-left"
                  >
                    Cancel appointment
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Appointment History */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-3">Appointment History</h2>
        {past.length === 0 && upcoming.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 py-16 text-center">
            <Calendar size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">No appointments yet</p>
            <p className="text-slate-400 text-sm mt-1">Click "Book Appointment" to get started</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Book Now
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <tr>
                    {['Doctor', 'Date', 'Time', 'Problem', 'Status', 'Charges'].map(h => (
                      <th key={h} className="px-5 py-3 text-left font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {past.map(appt => {
                    const badge = statusBadge[appt.status];
                    return (
                      <tr key={appt._id} className="hover:bg-slate-50">
                        <td className="px-5 py-3 font-medium text-slate-900">Dr. {appt.doctor?.name}</td>
                        <td className="px-5 py-3 text-slate-600 whitespace-nowrap">{new Date(appt.date).toLocaleDateString('en-IN')}</td>
                        <td className="px-5 py-3 text-slate-500 whitespace-nowrap">{appt.timeSlot}</td>
                        <td className="px-5 py-3 text-slate-600">{appt.problem}</td>
                        <td className="px-5 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${badge.cls}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-slate-700">
                          {appt.charges ? (
                            <span className="flex items-center gap-0.5 font-semibold">
                              <IndianRupee size={12} />{appt.charges}
                            </span>
                          ) : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ─── Book Appointment Modal ─── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Book Appointment</h3>
                <p className="text-xs text-slate-500">Fill the details below</p>
              </div>
              <button
                onClick={() => { setShowForm(false); setBookError(''); }}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleBook} className="p-6 space-y-4">
              {bookError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
                  <AlertCircle size={15} /> {bookError}
                </div>
              )}

              {/* Doctor */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Select Doctor *</label>
                <select
                  required
                  value={form.doctorId}
                  onChange={e => setForm({ ...form, doctorId: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">— Choose a doctor —</option>
                  {doctors.map(doc => (
                    <option key={doc._id} value={doc._id}>
                      Dr. {doc.name} ({doc.specialization || 'General'}) — ₹{doc.chargePerVisit || 0}/visit
                    </option>
                  ))}
                </select>
                {selectedDoc && (
                  <div className="mt-2 bg-blue-50 rounded-lg px-3 py-2 flex items-center gap-2 text-xs text-blue-700">
                    <Stethoscope size={13} />
                    {selectedDoc.specialization} • ₹{selectedDoc.chargePerVisit}/visit
                  </div>
                )}
              </div>

              {/* Problem */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Dental Problem *</label>
                <select
                  value={form.problem}
                  onChange={e => setForm({ ...form, problem: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {PROBLEMS.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Preferred Date *</label>
                <input
                  type="date" required
                  min={today}
                  value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Time Slot */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Time Slot *</label>
                <div className="grid grid-cols-4 gap-2">
                  {TIME_SLOTS.map(slot => (
                    <button
                      key={slot} type="button"
                      onClick={() => setForm({ ...form, timeSlot: slot })}
                      className={`py-2 rounded-lg text-xs font-medium border transition-all ${
                        form.timeSlot === slot
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
                {!form.timeSlot && <p className="text-xs text-slate-400 mt-1">Please select a time slot</p>}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setBookError(''); }}
                  className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={booking || !form.timeSlot}
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60"
                >
                  {booking ? 'Booking...' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
