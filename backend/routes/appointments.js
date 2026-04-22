const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const { protect, doctorOrAdmin } = require('../middleware/auth');

// @route   POST /api/appointments
// @desc    Book an appointment (Customer)
router.post('/', protect, async (req, res) => {
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
// @desc    Get all appointments (Admin)
//          Get own appointments (Customer/Doctor)
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'customer') {
      query.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      query.doctor = req.user._id;
    }

    const appointments = await Appointment.find(query)
      .populate('doctor', 'name specialization chargePerVisit')
      .populate('patient', 'name email');
      
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/appointments/:id/status
// @desc    Update appointment status (Doctor/Admin)
router.put('/:id/status', protect, doctorOrAdmin, async (req, res) => {
  const { status, treatmentPlan, charges } = req.body;
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Not found' });

    appointment.status = status || appointment.status;
    if (treatmentPlan) appointment.treatmentPlan = treatmentPlan;
    if (charges !== undefined) appointment.charges = charges;

    const updatedAppointment = await appointment.save();
    res.json(updatedAppointment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/appointments/:id
// @desc    Cancel appointment (Customer/Admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Not found' });

    if (req.user.role === 'customer' && appointment.patient.toString() !== req.user._id.toString()) {
       return res.status(401).json({ message: 'Not authorized' });
    }

    appointment.status = 'cancelled';
    await appointment.save();
    res.json({ message: 'Appointment cancelled' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
