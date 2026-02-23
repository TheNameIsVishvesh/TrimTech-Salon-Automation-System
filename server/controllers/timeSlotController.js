/**
 * Time slot CRUD – Owner manages slots
 */
const TimeSlot = require('../models/TimeSlot');

exports.getAll = async (req, res) => {
  try {
    const slots = await TimeSlot.find({}).sort({ startTime: 1 });
    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const slot = await TimeSlot.create(req.body);
    res.status(201).json(slot);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const slot = await TimeSlot.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!slot) return res.status(404).json({ message: 'Time slot not found' });
    res.json(slot);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const slot = await TimeSlot.findByIdAndDelete(req.params.id);
    if (!slot) return res.status(404).json({ message: 'Time slot not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
