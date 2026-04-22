import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CustomerDashboard from './pages/CustomerDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Navbar from './components/Navbar';

function App() {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
        <Navbar />
        <main className="flex-grow p-4 md:p-8 max-w-7xl mx-auto w-full">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            <Route 
              path="/customer" 
              element={user?.role === 'customer' ? <CustomerDashboard /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/doctor" 
              element={user?.role === 'doctor' ? <DoctorDashboard /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/admin" 
              element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />} 
            />
            
            <Route 
              path="/" 
              element={<Navigate to={user ? `/${user.role}` : "/login"} />} 
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
