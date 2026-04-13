/**
 * User model – Client, Employee, Owner
 * Passwords hashed with bcrypt; role-based access
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, enum: ['client', 'employee', 'owner'], required: true },
  phone: { type: String, trim: true },
  // Employee-specific
  employeeId: { type: String, unique: true, sparse: true },
  assignedServiceIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
  status: { type: String, enum: ['available', 'busy', 'on_leave', 'off'], default: 'available' },
  // Client-specific (optional)
  address: { type: String, trim: true },
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
