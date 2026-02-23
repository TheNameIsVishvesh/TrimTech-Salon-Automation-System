/**
 * Product model – Hair care, Skin care, Grooming
 * MRP, discount, stock for inventory
 */
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, enum: ['Hair care', 'Skin care', 'Grooming'], required: true },
  image: { type: String, default: '' },
  mrp: { type: Number, required: true, min: 0 }, // ₹
  discount: { type: Number, default: 0, min: 0 }, // ₹ off
  stock: { type: Number, required: true, min: 0, default: 0 },
  description: { type: String, trim: true },
  lowStockThreshold: { type: Number, default: 5 }
}, { timestamps: true });

productSchema.virtual('sellingPrice').get(function () {
  return Math.max(0, this.mrp - this.discount);
});

module.exports = mongoose.model('Product', productSchema);
