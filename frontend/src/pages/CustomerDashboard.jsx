import { useState, useEffect } from 'react';
import api from '../services/api';
import { Calendar, Clock, Activity, User as UserIcon } from 'lucide-react';

export default function CustomerDashboard() {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Booking state
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [problem, setProblem] = useState('Tooth Pain');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [docsRes, apptsRes] = await Promise.all([
        api.get('/users/doctors'),
        api.get('/appointments')
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
    try {
      await api.post('/appointments', {
        doctorId: selectedDoctor,
        date,
        timeSlot,
        problem
      });
      alert('Appointment booked successfully!');
      fetchData(); // Refresh history
      // Reset form
      setSelectedDoctor('');
      setDate('');
      setTimeSlot('');
    } catch (err) {
      alert(err.response?.data?.message || 'Error booking appointment');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel?')) return;
    try {
      await api.delete(`/appointments/${id}`);
      fetchData();
    } catch (err) {
      alert('Error cancelling appointment');
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="grid md:grid-cols-3 gap-8">
      {/* Booking Form */}
      <div className="md:col-span-1 space-y-6">
        <div className="card p-6 border border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Calendar size={20} className="text-blue-600" />
            Book Appointment
          </h2>
          <form onSubmit={handleBook} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Select Dentist</label>
              <select 
                required
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">-- Choose Dentist --</option>
                {doctors.map(doc => (
                  <option key={doc._id} value={doc._id}>Dr. {doc.name} - ${doc.chargePerVisit || 50}/visit</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Dental Problem</label>
              <select 
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option>Tooth Pain</option>
                <option>Cleaning</option>
                <option>Root Canal</option>
                <option>Checkup</option>
                <option>Whitening</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
              <input 
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Time Slot</label>
              <select 
                required
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">-- Select Time --</option>
                <option>09:00 AM</option>
                <option>10:00 AM</option>
                <option>11:00 AM</option>
                <option>02:00 PM</option>
                <option>03:00 PM</option>
                <option>04:00 PM</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md transition-colors"
            >
              Book Now
            </button>
          </form>
        </div>
      </div>

      {/* History */}
      <div className="md:col-span-2">
        <h2 className="text-xl font-bold text-slate-900 mb-4">My Appointments</h2>
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          {appointments.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No appointments found. Book your first visit!
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {appointments.map((appt) => (
                <div key={appt._id} className="p-4 sm:p-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                  <div className="space-y-1">
                    <div className="font-medium text-slate-900 flex items-center gap-2">
                      <UserIcon size={16} className="text-slate-400" />
                      Dr. {appt.doctor?.name || 'Unknown'}
                    </div>
                    <div className="text-sm text-slate-600 flex items-center gap-4">
                      <span className="flex items-center gap-1"><Calendar size={14}/> {new Date(appt.date).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><Clock size={14}/> {appt.timeSlot}</span>
                    </div>
                    <div className="text-sm text-slate-600 flex items-center gap-1">
                      <Activity size={14}/> {appt.problem}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider
                      ${appt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        appt.status === 'approved' ? 'bg-blue-100 text-blue-800' : 
                        appt.status === 'completed' ? 'bg-green-100 text-green-800' : 
                        'bg-red-100 text-red-800'}`}
                    >
                      {appt.status}
                    </span>
                    {(appt.status === 'pending' || appt.status === 'approved') && (
                      <button 
                        onClick={() => handleCancel(appt._id)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        Cancel
                      </button>
                    )}
                    {appt.status === 'completed' && appt.charges > 0 && (
                      <div className="text-sm font-bold text-slate-900">Total: ${appt.charges}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
