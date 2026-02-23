/**
 * Auth controller – Register, Login, get profile
 * Role-based redirect handled on frontend using role in token response
 */
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validationResult } = require('express-validator');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password, role, phone } = req.body;
    if (!['client', 'employee', 'owner'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password, role, phone });
    const token = generateToken(user._id);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = generateToken(user._id);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('assignedServiceIds', 'name category duration price');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route   PATCH /api/auth/me – update own profile (e.g. employee status)
exports.updateMe = async (req, res) => {
  try {
    const allowed = ['name', 'phone', 'status'];
    const updates = {};
    Object.keys(req.body).forEach(k => { if (allowed.includes(k)) updates[k] = req.body[k]; });
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true })
      .select('-password')
      .populate('assignedServiceIds', 'name category duration price');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
