const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, admin } = require('../middleware/auth');

// @route   GET /api/users/doctors
// @desc    Get all doctors (Public)
router.get('/doctors', async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' }).select('-password');
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users
// @desc    Get all users (Admin)
router.get('/', protect, admin, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/slots
// @desc    Update doctor slots (Doctor)
router.put('/slots', protect, async (req, res) => {
  if (req.user.role !== 'doctor') return res.status(401).json({ message: 'Not authorized' });
  
  try {
    const user = await User.findById(req.user._id);
    user.availableSlots = req.body.slots || user.availableSlots;
    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
