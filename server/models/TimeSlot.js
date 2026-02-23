/**
 * TimeSlot model – Configurable slots (e.g. 09:00–09:30)
 * Used for booking availability
 */
const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
  startTime: { type: String, required: true }, // "09:00" 24h stored, display 12h
  endTime: { type: String, required: true },
  label: { type: String, trim: true }, // e.g. "Morning"
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('TimeSlot', timeSlotSchema);
