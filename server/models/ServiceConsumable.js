const mongoose = require('mongoose');

const serviceConsumableSchema = new mongoose.Schema({
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', required: true }, // refers to Inventory collection as requested
    quantityUsed: { type: Number, required: true, min: 0 }
}, { timestamps: true });

module.exports = mongoose.model('ServiceConsumable', serviceConsumableSchema);
