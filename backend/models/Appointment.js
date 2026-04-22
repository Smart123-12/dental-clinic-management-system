const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  problem: { type: String, required: true }, // e.g., 'Tooth Pain', 'Cleaning', 'Root Canal'
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed'], default: 'pending' },
  treatmentPlan: { type: String },
  charges: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
