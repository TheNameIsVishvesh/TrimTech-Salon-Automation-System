const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    productName: { type: String, required: true, trim: true },
    category: { type: String, required: true },
    totalStock: { type: Number, required: true, min: 0, default: 0 },
    unit: { type: String, required: true }, // e.g. ml, g, pieces
    lowStockThreshold: { type: Number, required: true, default: 5 }
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);
