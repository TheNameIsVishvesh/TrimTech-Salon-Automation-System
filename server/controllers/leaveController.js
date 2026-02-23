/**
 * Employee leave – Apply and list (owner can approve/reject)
 */
const Leave = require('../models/Leave');

exports.getAll = async (req, res) => {
  try {
    const filter = req.user.role === 'owner' ? {} : { employeeId: req.user._id };
    const list = await Leave.find(filter)
      .populate('employeeId', 'name employeeId')
      .sort({ startDate: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const leave = await Leave.create({ ...req.body, employeeId: req.user._id });
    res.status(201).json(leave);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ message: 'Leave not found' });
    if (req.user.role !== 'owner') return res.status(403).json({ message: 'Only owner can update' });
    leave.status = req.body.status;
    await leave.save();
    res.json(leave);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
