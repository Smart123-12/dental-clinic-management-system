const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const { protect, doctorOrAdmin } = require('../middleware/auth');

// @route   POST /api/appointments
// @desc    Book an appointment (Customer)
router.post('/', protect, async (req, res) => {
  if (req.user.role !== 'customer') {
    return res.status(403).json({ message: 'Only patients can book appointments' });
  }
  const { doctorId, date, timeSlot, problem } = req.body;
  try {
    const appointment = new Appointment({
      patient: req.user._id,
      doctor: doctorId,
      date,
      timeSlot,
      problem,
    });
    const createdAppointment = await appointment.save();
    res.status(201).json(createdAppointment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/appointments
// @desc    Get all appointments (Admin) | Own appointments (Customer/Doctor)
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'customer') {
      query.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      query.doctor = req.user._id;
    }
    // admin gets all

    const appointments = await Appointment.find(query)
      .populate('doctor', 'name specialization chargePerVisit email')
      .populate('patient', 'name email')
      .sort({ createdAt: -1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/appointments/:id
// @desc    Get single appointment
router.get('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('doctor', 'name specialization chargePerVisit')
      .populate('patient', 'name email');
    if (!appointment) return res.status(404).json({ message: 'Not found' });
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/appointments/:id/status
// @desc    Update appointment status (Doctor/Admin)
router.put('/:id/status', protect, doctorOrAdmin, async (req, res) => {
  const { status, treatmentPlan, charges, notes } = req.body;
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Not found' });

    // Doctor can only manage their own appointments
    if (req.user.role === 'doctor' && appointment.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to manage this appointment' });
    }

    appointment.status = status || appointment.status;
    if (treatmentPlan) appointment.treatmentPlan = treatmentPlan;
    if (charges !== undefined) appointment.charges = charges;
    if (notes) appointment.notes = notes;

    const updatedAppointment = await appointment.save();
    res.json(updatedAppointment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/appointments/:id
// @desc    Cancel appointment (Customer cancels own / Admin cancels any)
router.delete('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Not found' });

    if (req.user.role === 'customer' && appointment.patient.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (req.user.role === 'doctor') {
      return res.status(403).json({ message: 'Doctors cannot delete appointments' });
    }

    appointment.status = 'cancelled';
    await appointment.save();
    res.json({ message: 'Appointment cancelled' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
