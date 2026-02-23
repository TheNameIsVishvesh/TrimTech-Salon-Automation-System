/**
 * Service model – Hair, Beard, Facial, Spa, Bridal, Skin Care
 * Duration in minutes, price in INR
 */
const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: {
    type: String,
    enum: ['Hair', 'Beard', 'Facial', 'Spa', 'Bridal', 'Skin Care'],
    required: true
  },
  duration: { type: Number, required: true, min: 5 }, // minutes
  price: { type: Number, required: true, min: 0 }, // ₹
  description: { type: String, trim: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
