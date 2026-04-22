import { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, Activity, DollarSign, Calendar } from 'lucide-react';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, apptsRes] = await Promise.all([
        api.get('/users'),
        api.get('/appointments')
      ]);
      setUsers(usersRes.data);
      setAppointments(apptsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  const totalRevenue = appointments.reduce((sum, appt) => sum + (appt.charges || 0), 0);
  const totalDoctors = users.filter(u => u.role === 'doctor').length;
  const totalPatients = users.filter(u => u.role === 'customer').length;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-full text-blue-600">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Patients</p>
            <p className="text-2xl font-bold text-slate-900">{totalPatients}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-indigo-100 p-3 rounded-full text-indigo-600">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Doctors</p>
            <p className="text-2xl font-bold text-slate-900">{totalDoctors}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-full text-green-600">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Revenue</p>
            <p className="text-2xl font-bold text-slate-900">${totalRevenue}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-orange-100 p-3 rounded-full text-orange-600">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Appointments</p>
            <p className="text-2xl font-bold text-slate-900">{appointments.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Appointments */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h2 className="font-bold text-slate-800">All Appointments</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3">Patient</th>
                  <th className="px-4 py-3">Doctor</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {appointments.slice(0, 10).map((appt) => (
                  <tr key={appt._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">{appt.patient?.name}</td>
                    <td className="px-4 py-3">Dr. {appt.doctor?.name}</td>
                    <td className="px-4 py-3">{new Date(appt.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase
                        ${appt.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}
                      >
                        {appt.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Users List */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h2 className="font-bold text-slate-800">Registered Users</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{user.name}</td>
                    <td className="px-4 py-3 text-slate-500">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase
                        ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                          user.role === 'doctor' ? 'bg-blue-100 text-blue-800' : 
                          'bg-slate-100 text-slate-800'}`}
                      >
                        {user.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
