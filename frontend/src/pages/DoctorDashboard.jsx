import { useState, useEffect } from 'react';
import api from '../services/api';
import { Calendar, User, Clock } from 'lucide-react';

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [editingAppt, setEditingAppt] = useState(null);
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [charges, setCharges] = useState(0);

  useEffect(() => {
    fetchAppointments();
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
    try {
      await api.put(`/appointments/${editingAppt._id}/status`, {
        status: 'completed',
        treatmentPlan,
        charges: Number(charges)
      });
      setEditingAppt(null);
      fetchAppointments();
    } catch (err) {
      alert('Error saving treatment plan');
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Doctor Dashboard</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="uppercase tracking-wider border-b-2 border-slate-200 bg-slate-50 text-slate-600">
              <tr>
                <th scope="col" className="px-6 py-4">Patient</th>
                <th scope="col" className="px-6 py-4">Date & Time</th>
                <th scope="col" className="px-6 py-4">Problem</th>
                <th scope="col" className="px-6 py-4">Status</th>
                <th scope="col" className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {appointments.map((appt) => (
                <tr key={appt._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900 flex items-center gap-2">
                      <User size={16} className="text-slate-400" />
                      {appt.patient?.name || 'Unknown'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar size={14} /> {new Date(appt.date).toLocaleDateString()}
                      <span className="text-slate-300">|</span>
                      <Clock size={14} /> {appt.timeSlot}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{appt.problem}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase tracking-wider
                      ${appt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        appt.status === 'approved' ? 'bg-blue-100 text-blue-800' : 
                        appt.status === 'completed' ? 'bg-green-100 text-green-800' : 
                        'bg-red-100 text-red-800'}`}
                    >
                      {appt.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {appt.status === 'pending' && (
                        <>
                          <button onClick={() => handleStatusUpdate(appt._id, 'approved')} className="text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-3 py-1 rounded">Approve</button>
                          <button onClick={() => handleStatusUpdate(appt._id, 'rejected')} className="text-red-600 hover:text-red-800 font-medium bg-red-50 px-3 py-1 rounded">Reject</button>
                        </>
                      )}
                      {appt.status === 'approved' && (
                        <button 
                          onClick={() => {
                            setEditingAppt(appt);
                            setTreatmentPlan(appt.treatmentPlan || '');
                            setCharges(appt.charges || 0);
                          }}
                          className="text-green-600 hover:text-green-800 font-medium bg-green-50 px-3 py-1 rounded"
                        >
                          Complete Visit
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {appointments.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">No appointments found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Completion Modal */}
      {editingAppt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Complete Appointment</h3>
            <form onSubmit={handleComplete} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Treatment Plan / Notes</label>
                <textarea 
                  required
                  rows={3}
                  value={treatmentPlan}
                  onChange={(e) => setTreatmentPlan(e.target.value)}
                  className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Total Charges ($)</label>
                <input 
                  type="number"
                  required
                  min="0"
                  value={charges}
                  onChange={(e) => setCharges(e.target.value)}
                  className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => setEditingAppt(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Save & Complete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
