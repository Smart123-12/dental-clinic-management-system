// =====================================================
// OFFLINE MOCK API — NO BACKEND REQUIRED
// Backend completely removed. Everything works locally.
// =====================================================

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// ── Seed Data ─────────────────────────────────────
let mockUsers = [
  { _id: 'u1', name: 'Admin User',  email: 'admin@test.com',    password: '123456', role: 'admin' },
  {
    _id: 'u2', name: 'Dr. Smith', email: 'doctor@test.com', password: '123456',
    role: 'doctor', specialization: 'Orthodontist', chargePerVisit: 500,
    availableSlots: ['09:00 AM', '10:00 AM', '02:00 PM'],
  },
  { _id: 'u3', name: 'John Doe', email: 'customer@test.com', password: '123456', role: 'customer' },
];

let mockAppointments = [
  {
    _id: 'a1',
    patient:  { _id: 'u3', name: 'John Doe',   email: 'customer@test.com', role: 'customer' },
    doctor:   { _id: 'u2', name: 'Dr. Smith',  specialization: 'Orthodontist', chargePerVisit: 500 },
    date: new Date().toISOString(),
    timeSlot: '10:00 AM',
    problem: 'Tooth Pain',
    status: 'pending',
    charges: 0,
  },
];

// ── Helpers ───────────────────────────────────────
const me = () => JSON.parse(localStorage.getItem('user') || '{}');

const throwMsg = (msg) => {
  const err = new Error(msg);
  err.response = { data: { message: msg } };
  throw err;
};

// ── POST ──────────────────────────────────────────
async function post(url, data = {}) {
  await delay(400);

  // LOGIN
  if (url === '/auth/login') {
    const user = mockUsers.find((u) => u.email === data.email);
    if (!user) throwMsg('Invalid email or password. Use demo cards to login!');
    const { password: _p, ...safe } = user;
    return { data: { token: 'mock-jwt-token', ...safe } };
  }

  // REGISTER
  if (url === '/auth/register') {
    if (mockUsers.find((u) => u.email === data.email))
      throwMsg('Email already registered. Please login instead.');
    const newUser = { _id: 'u' + Date.now(), ...data };
    mockUsers.push(newUser);
    const { password: _p, ...safe } = newUser;
    return { data: { token: 'mock-jwt-token', ...safe } };
  }

  // OPENCODE AUTH
  if (url === '/auth/opencode') {
    const { password: _p, ...safe } = mockUsers[2];
    return { data: { token: 'mock-jwt-token', ...safe } };
  }

  // CREATE USER (admin)
  if (url === '/users') {
    const newUser = { _id: 'u' + Date.now(), ...data };
    mockUsers.push(newUser);
    return { data: newUser };
  }

  // BOOK APPOINTMENT
  if (url === '/appointments') {
    const doc = mockUsers.find((u) => u._id === data.doctorId);
    const currentUser = me();
    const newAppt = {
      _id: 'a' + Date.now(),
      patient: { _id: currentUser._id, name: currentUser.name, email: currentUser.email },
      doctor:  doc ? { _id: doc._id, name: doc.name, specialization: doc.specialization, chargePerVisit: doc.chargePerVisit } : null,
      status: 'pending',
      charges: 0,
      date: data.date,
      timeSlot: data.timeSlot,
      problem: data.problem,
    };
    mockAppointments.push(newAppt);
    return { data: newAppt };
  }

  return { data: {} };
}

// ── GET ───────────────────────────────────────────
async function get(url) {
  await delay(300);

  if (url === '/users')
    return { data: mockUsers.map(({ password: _p, ...u }) => u) };

  if (url === '/users/doctors')
    return { data: mockUsers.filter((u) => u.role === 'doctor').map(({ password: _p, ...u }) => u) };

  if (url === '/users/me') {
    const currentUser = me();
    const user = mockUsers.find((u) => u._id === currentUser._id) || currentUser;
    const { password: _p, ...safe } = user;
    return { data: safe };
  }

  if (url === '/appointments') {
    const currentUser = me();
    let appts = [...mockAppointments];
    if (currentUser.role === 'customer')
      appts = appts.filter((a) => a.patient?._id === currentUser._id);
    else if (currentUser.role === 'doctor')
      appts = appts.filter((a) => a.doctor?._id === currentUser._id);
    return { data: appts };
  }

  return { data: [] };
}

// ── PUT ───────────────────────────────────────────
async function put(url, data = {}) {
  await delay(300);

  // UPDATE APPOINTMENT STATUS  e.g. /appointments/a1/status
  if (url.includes('/appointments/') && url.includes('/status')) {
    const parts = url.split('/');
    const id = parts[2];
    const appt = mockAppointments.find((a) => a._id === id);
    if (appt) Object.assign(appt, data);
    return { data: appt };
  }

  // UPDATE DOCTOR SLOTS
  if (url === '/users/myslots/update') {
    const currentUser = me();
    const user = mockUsers.find((u) => u._id === currentUser._id);
    if (user) {
      user.availableSlots = data.slots;
      localStorage.setItem('user', JSON.stringify({ ...currentUser, availableSlots: data.slots }));
    }
    return { data: user };
  }

  return { data: {} };
}

// ── DELETE ────────────────────────────────────────
async function del(url) {
  await delay(300);

  if (url.startsWith('/users/')) {
    const id = url.split('/')[2];
    mockUsers = mockUsers.filter((u) => u._id !== id);
    return { data: { success: true } };
  }

  if (url.startsWith('/appointments/')) {
    const id = url.split('/')[2];
    mockAppointments = mockAppointments.filter((a) => a._id !== id);
    return { data: { success: true } };
  }

  return { data: { success: true } };
}

// ── Export (same shape as axios instance) ─────────
const api = {
  post,
  get,
  put,
  delete: del,
  interceptors: { request: { use: () => {} }, response: { use: () => {} } },
};

export default api;
