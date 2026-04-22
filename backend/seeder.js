const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Appointment = require('./models/Appointment');

const seedDemoData = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('✅ Demo data already exists — skipping seed.');
      return;
    }

    console.log('🌱 Seeding demo data...');

    // Create Demo Users
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@dentalcare.com',
      password: 'Admin@123',
      role: 'admin',
    });

    const doctor1 = await User.create({
      name: 'Dr. Priya Sharma',
      email: 'doctor@dentalcare.com',
      password: 'Doctor@123',
      role: 'doctor',
      specialization: 'Orthodontist',
      chargePerVisit: 1500,
      availableSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'],
    });

    const doctor2 = await User.create({
      name: 'Dr. Rohan Mehta',
      email: 'doctor2@dentalcare.com',
      password: 'Doctor@123',
      role: 'doctor',
      specialization: 'Endodontist',
      chargePerVisit: 2000,
      availableSlots: ['10:00 AM', '11:00 AM', '03:00 PM', '04:00 PM'],
    });

    const patient = await User.create({
      name: 'Raj Patel',
      email: 'patient@dentalcare.com',
      password: 'Patient@123',
      role: 'customer',
    });

    // Create Demo Appointments
    await Appointment.create({
      patient: patient._id,
      doctor: doctor1._id,
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      timeSlot: '10:00 AM',
      problem: 'Tooth Pain',
      status: 'pending',
    });

    await Appointment.create({
      patient: patient._id,
      doctor: doctor2._id,
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      timeSlot: '11:00 AM',
      problem: 'Root Canal',
      status: 'completed',
      treatmentPlan: 'Root canal treatment done on tooth #36. Prescribed antibiotics for 5 days. Follow-up in 2 weeks.',
      charges: 3500,
    });

    await Appointment.create({
      patient: patient._id,
      doctor: doctor1._id,
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      timeSlot: '09:00 AM',
      problem: 'Cleaning',
      status: 'approved',
    });

    console.log('✅ Demo data seeded successfully!');
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 DEMO LOGIN CREDENTIALS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🛡️  Admin    → admin@dentalcare.com   / Admin@123');
    console.log('🩺  Doctor   → doctor@dentalcare.com  / Doctor@123');
    console.log('👤  Patient  → patient@dentalcare.com / Patient@123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
  }
};

module.exports = seedDemoData;
