/**
 * Appointment CRUD – Booking flow, status updates, real-time emit
 */
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Service = require('../models/Service');
const { emitAppointmentUpdate } = require('../config/socket');

// Generate invoice number
const nextInvoiceNumber = async () => {
  const last = await Appointment.findOne({ invoiceNumber: { $exists: true, $ne: '' } })
    .sort({ createdAt: -1 }).select('invoiceNumber');
  const num = last && last.invoiceNumber ? parseInt(last.invoiceNumber.replace('INV-', ''), 10) + 1 : 1001;
  return `INV-${num}`;
};

// GET all (owner: all; employee: own; client: own)
exports.getAll = async (req, res) => {
  try {
    const { role } = req.user;
    const { from, to, employeeId, status } = req.query;
    const filter = {};
    if (role === 'client') filter.clientId = req.user._id;
    if (role === 'employee') filter.employeeId = req.user._id;
    if (employeeId && role === 'owner') filter.employeeId = employeeId;
    if (status) filter.status = status;
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }
    const appointments = await Appointment.find(filter)
      .populate('clientId', 'name email phone')
      .populate('employeeId', 'name email employeeId status')
      .populate('serviceId', 'name category duration price')
      .sort({ date: 1, slotStart: 1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const apt = await Appointment.findById(req.params.id)
      .populate('clientId', 'name email phone')
      .populate('employeeId', 'name email employeeId')
      .populate('serviceId', 'name category duration price');
    if (!apt) return res.status(404).json({ message: 'Appointment not found' });
    if (req.user.role === 'client' && apt.clientId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    if (req.user.role === 'employee' && apt.employeeId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(apt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST – Create appointment (client books)
exports.create = async (req, res) => {
  try {
    const { employeeId, serviceId, date, slotStart, slotEnd } = req.body;
    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    const amount = service.price;
    const gstPercent = 18;
    const gstAmount = Math.round(amount * (gstPercent / 100));
    const totalAmount = amount + gstAmount;
    const invoiceNumber = await nextInvoiceNumber();

    const appointment = await Appointment.create({
      clientId: req.user._id,
      employeeId,
      serviceId,
      date: new Date(date),
      slotStart,
      slotEnd,
      amount,
      gstPercent,
      gstAmount,
      totalAmount,
      invoiceNumber,
      paymentStatus: 'paid'
    });

    const populated = await Appointment.findById(appointment._id)
      .populate('clientId', 'name email phone')
      .populate('employeeId', 'name email employeeId')
      .populate('serviceId', 'name category duration price');

    emitAppointmentUpdate({ type: 'created', appointment: populated });
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH – Update status (reschedule, cancel, complete)
exports.update = async (req, res) => {
  try {
    const apt = await Appointment.findById(req.params.id);
    if (!apt) return res.status(404).json({ message: 'Appointment not found' });

    const allowed = ['status', 'date', 'slotStart', 'slotEnd', 'rating', 'feedback'];
    const updates = {};
    Object.keys(req.body).forEach(k => { if (allowed.includes(k)) updates[k] = req.body[k]; });

    const updated = await Appointment.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate('clientId', 'name email phone')
      .populate('employeeId', 'name email employeeId')
      .populate('serviceId', 'name category duration price');

    emitAppointmentUpdate({ type: 'updated', appointment: updated });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET available slots for a date + employee
exports.getAvailableSlots = async (req, res) => {
  try {
    const { date, employeeId } = req.query;
    if (!date || !employeeId) return res.status(400).json({ message: 'date and employeeId required' });
    const TimeSlot = require('../models/TimeSlot');
    const slots = await TimeSlot.find({ isActive: true }).sort({ startTime: 1 });
    const booked = await Appointment.find({
      employeeId,
      date: { $gte: new Date(date), $lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)) },
      status: { $nin: ['cancelled'] }
    }).select('slotStart slotEnd');

    const bookedSet = new Set(booked.map(b => `${b.slotStart}-${b.slotEnd}`));
    const available = slots.filter(s => !bookedSet.has(`${s.startTime}-${s.endTime}`));
    res.json(available);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
