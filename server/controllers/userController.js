/**
 * User management – Owner: add/remove employees, assign services
 */
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// List users (owner: all; filter by role)
exports.getAll = async (req, res) => {
  try {
    const { role } = req.query;
    const filter = {};
    if (role) filter.role = role;
    const users = await User.find(filter).select('-password').populate('assignedServiceIds', 'name category');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password').populate('assignedServiceIds', 'name category');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Owner: create employee (unique ID + password)
exports.createEmployee = async (req, res) => {
  try {
    const { name, email, password, phone, assignedServiceIds } = req.body;
    const exists = await User.findOne({ $or: [{ email }, { employeeId: req.body.employeeId }] });
    if (exists) return res.status(400).json({ message: 'Email or Employee ID already exists' });

    let employeeId = req.body.employeeId;
    if (!employeeId) {
      const count = await User.countDocuments({ role: 'employee' });
      employeeId = `EMP${String(count + 1).padStart(3, '0')}`;
    }
    const user = await User.create({
      name,
      email,
      password: password || 'emp123',
      role: 'employee',
      phone,
      employeeId,
      assignedServiceIds: assignedServiceIds || []
    });
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      employeeId: user.employeeId,
      role: user.role
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.password;
    if (req.body.password) {
      updates.password = await bcrypt.hash(req.body.password, 10);
    }
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
