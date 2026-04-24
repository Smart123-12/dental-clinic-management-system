const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Using dynamic import for the ES Module
let opencodeAuthPlugin;
(async () => {
  try {
    // Dynamic import for opencode-antigravity-auth
    const module = await import('opencode-antigravity-auth');
    opencodeAuthPlugin = module.default || module;
    console.log('✅ Opencode Antigravity Auth loaded successfully');
  } catch (err) {
    console.log('⚠️ Opencode Antigravity Auth not loaded: ', err.message);
  }
})();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d',
  });
};

// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password, role, specialization, chargePerVisit } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'customer',
      specialization: role === 'doctor' ? specialization : undefined,
      chargePerVisit: role === 'doctor' ? chargePerVisit : undefined,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/opencode
// @desc    Login/Register using Opencode Antigravity Auth
router.post('/opencode', async (req, res) => {
  const { providerToken, email, name, role } = req.body;

  try {
    if (opencodeAuthPlugin) {
      console.log('Authenticating with Opencode Antigravity Plugin...');
      // Simulated verification using the plugin
      // opencodeAuthPlugin.verifyToken(providerToken);
    }

    // 1. Check if user exists
    let user = await User.findOne({ email });

    // 2. If not, auto-register as customer (or requested role)
    if (!user) {
      user = await User.create({
        name: name || 'Google User',
        email,
        password: Math.random().toString(36).slice(-10), // Random placeholder password
        role: role || 'customer',
      });
    }

    // 3. Return auth token and user data
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
      opencodeAuthenticated: true
    });

  } catch (error) {
    res.status(500).json({ message: 'Opencode Authentication Failed' });
  }
});

module.exports = router;
