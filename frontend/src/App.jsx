import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CustomerDashboard from './pages/CustomerDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

function ProtectedLayout({ children, allowedRole }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user) return <Navigate to="/login" />;
  if (allowedRole && user.role !== allowedRole) return <Navigate to={`/${user.role}`} />;

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function App() {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to={`/${user.role}`} />} />
        <Route path="/signup" element={!user ? <Signup /> : <Navigate to={`/${user.role}`} />} />

        {/* Protected Routes */}
        <Route
          path="/customer"
          element={
            <ProtectedLayout allowedRole="customer">
              <CustomerDashboard />
            </ProtectedLayout>
          }
        />
        <Route
          path="/doctor"
          element={
            <ProtectedLayout allowedRole="doctor">
              <DoctorDashboard />
            </ProtectedLayout>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedLayout allowedRole="admin">
              <AdminDashboard />
            </ProtectedLayout>
          }
        />

        {/* Default redirect */}
        <Route
          path="/"
          element={<Navigate to={user ? `/${user.role}` : '/login'} />}
        />
        <Route
          path="*"
          element={<Navigate to={user ? `/${user.role}` : '/login'} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
