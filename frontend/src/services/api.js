import axios from 'axios';

// --- OFFLINE MOCK BACKEND ---
// The user requested to remove the backend requirement and fix the login error.
// This mock API entirely replaces the real backend connection, allowing the app
// to function fully offline directly from the browser using mock memory state.

const api = {};

// Mock Data
let mockUsers = [
  { _id: '1', name: 'Admin User', email: 'admin@test.com', role: 'admin' },
  { _id: '2', name: 'Dr. Smith', email: 'doctor@test.com', role: 'doctor', specialization: 'Orthodontist', chargePerVisit: 500, availableSlots: ['09:00 AM', '10:00 AM', '02:00 PM'] },
  { _id: '3', name: 'John Doe', email: 'customer@test.com', role: 'customer' }
];

let mockAppointments = [
  { _id: '101', patient: mockUsers[2], doctor: mockUsers[1], date: new Date().toISOString(), timeSlot: '10:00 AM', problem: 'Tooth Pain', status: 'pending' }
];

const delay = (ms) => new Promise(res => setTimeout(res, ms));

api.post = async (url, data) => {
  await delay(400); // simulate network delay
  
  if (url === '/auth/login') {
    const user = mockUsers.find(u => u.email === data.email);
    if (!user) {
      const err = new Error('Invalid email or password');
      err.response = { data: { message: 'Invalid email or password (Hint: use demo users)' } };
      throw err;
    }
    return { data: { token: 'mock-token', ...user } };
  }
  
  if (url === '/auth/register') {
    const exists = mockUsers.find(u => u.email === data.email);
    if (exists) {
      const err = new Error('Email already registered');
      err.response = { data: { message: 'Email already registered' } };
      throw err;
    }
    const newUser = { _id: Date.now().toString(), ...data };
    mockUsers.push(newUser);
    return { data: { token: 'mock-token', ...newUser } };
  }
  
  if (url === '/auth/opencode') {
    return { data: { token: 'mock-token', ...mockUsers[2] } };
  }
  
  if (url === '/users') {
    const newUser = { _id: Date.now().toString(), ...data };
    mockUsers.push(newUser);
    return { data: newUser };
  }
  
  if (url === '/appointments') {
    const doc = mockUsers.find(u => u._id === data.doctorId);
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const newAppt = { 
      _id: Date.now().toString(), 
      patient: currentUser, 
      doctor: doc, 
      status: 'pending', 
      ...data 
    };
    mockAppointments.push(newAppt);
    return { data: newAppt };
  }
  
  return { data: {} };
};

api.get = async (url) => {
  await delay(300);
  
  if (url === '/users') return { data: mockUsers };
  
  if (url === '/users/doctors') return { data: mockUsers.filter(u => u.role === 'doctor') };
  
  if (url === '/appointments') {
     const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
     let appts = [...mockAppointments];
     // Filter based on role if needed (customer only sees theirs, doctor theirs, admin sees all)
     if (currentUser.role === 'customer') {
       appts = appts.filter(a => a.patient?._id === currentUser._id);
     } else if (currentUser.role === 'doctor') {
       appts = appts.filter(a => a.doctor?._id === currentUser._id);
     }
     return { data: appts };
  }
  
  if (url === '/users/me') {
     const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
     const user = mockUsers.find(u => u._id === currentUser._id) || currentUser;
     return { data: user };
  }
  
  return { data: [] };
};

api.put = async (url, data) => {
  await delay(300);
  
  if (url.includes('/status')) {
    const id = url.split('/')[2];
    const appt = mockAppointments.find(a => a._id === id);
    if (appt) {
       Object.assign(appt, data);
    }
    return { data: appt };
  }
  
  if (url === '/users/myslots/update') {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const user = mockUsers.find(u => u._id === currentUser._id);
    if (user) {
       user.availableSlots = data.slots;
       localStorage.setItem('user', JSON.stringify(user));
    }
    return { data: user };
  }
  
  return { data: {} };
};

api.delete = async (url) => {
  await delay(300);
  
  if (url.startsWith('/users/')) {
     const id = url.split('/')[2];
     mockUsers = mockUsers.filter(u => u._id !== id);
     return { data: { success: true } };
  }
  
  if (url.startsWith('/appointments/')) {
     const id = url.split('/')[2];
     mockAppointments = mockAppointments.filter(a => a._id !== id);
     return { data: { success: true } };
  }
  
  return { data: { success: true } };
};

// Dummy interceptors so no code crashes if it tries to attach headers
api.interceptors = {
  request: { use: () => {} },
  response: { use: () => {} }
};

export default api;
