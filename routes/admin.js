const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find admin by email
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      return res.status(409).json({ message: 'Admin with this email already exists' });
    }

    // Create new admin
    const newAdmin = new Admin({
      name,
      email: email.toLowerCase(),
      password,
    });

    await newAdmin.save();

    res.status(201).json({
      message: 'Admin registered successfully',
      admin: {
        id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});


// Verify token
router.get('/verify', authenticateAdmin, (req, res) => {
  res.json({
    message: 'Token is valid',
    admin: {
      id: req.admin._id,
      email: req.admin.email,
      name: req.admin.name
    }
  });
});

module.exports = router;