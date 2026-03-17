const Inventory = require('../models/Inventory');
const ServiceConsumable = require('../models/ServiceConsumable');
const { emitAppointmentUpdate } = require('../config/socket'); // to emit low stock notifications

exports.getAll = async (req, res) => {
    try {
        const inventory = await Inventory.find().sort({ productName: 1 });
        res.json(inventory);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const item = await Inventory.create(req.body);
        res.status(201).json(item);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!item) return res.status(404).json({ message: 'Item not found' });
        res.json(item);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const item = await Inventory.findByIdAndDelete(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });
        res.json({ message: 'Item deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getAllConsumables = async (req, res) => {
    try {
        const consumables = await ServiceConsumable.find()
            .populate('serviceId', 'name')
            .populate('productId', 'productName unit');
        res.json(consumables);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createConsumable = async (req, res) => {
    try {
        const { serviceId, productId, quantityUsed } = req.body;
        let consumable = await ServiceConsumable.findOne({ serviceId, productId });
        if (consumable) {
            consumable.quantityUsed = quantityUsed;
            await consumable.save();
        } else {
            consumable = await ServiceConsumable.create({ serviceId, productId, quantityUsed });
        }
        const populated = await ServiceConsumable.findById(consumable._id)
            .populate('serviceId', 'name')
            .populate('productId', 'productName unit');
        res.status(201).json(populated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteConsumable = async (req, res) => {
    try {
        const consumable = await ServiceConsumable.findByIdAndDelete(req.params.id);
        if (!consumable) return res.status(404).json({ message: 'Consumable not found' });
        res.json({ message: 'Consumable deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
