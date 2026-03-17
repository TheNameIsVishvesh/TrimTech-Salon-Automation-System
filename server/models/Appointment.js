/**
 * Appointment model – Links client, employee, service, slot, payment
 * GST-ready invoice fields
 */
const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  date: { type: Date, required: true }, // booking date
  startTime: { type: String, required: true }, // "09:00"
  endTime: { type: String, required: true },
  duration: { type: Number, required: true },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'],
    default: 'scheduled'
  },
  // Payment (simulated)
  amount: { type: Number, required: true, min: 0 },
  gstPercent: { type: Number, default: 18 },
  gstAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'paid' },
  paymentMethod: { type: String, enum: ['UPI', 'Card', 'Cash'], default: 'Cash' },
  convenienceFee: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  invoiceNumber: { type: String, unique: true, sparse: true },
  // Feedback
  rating: { type: Number, min: 1, max: 5 },
  feedback: { type: String, trim: true }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
