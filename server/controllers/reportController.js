/**
 * Reports & analytics – Revenue, bookings, top services, staff performance
 * Smart: service demand, peak hours (mock/aggregation)
 */
const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const User = require('../models/User');

// Daily revenue, monthly bookings
exports.dashboard = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const [dailyRevenue, monthlyBookings, topServices, staffPerformance] = await Promise.all([
      Appointment.aggregate([
        { $match: { date: { $gte: today, $lt: tomorrow }, status: { $nin: ['cancelled'] }, paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Appointment.countDocuments({ date: { $gte: monthStart }, status: { $nin: ['cancelled'] } }),
      Appointment.aggregate([
        { $match: { status: 'completed', paymentStatus: 'paid' } },
        { $group: { _id: '$serviceId', count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $lookup: { from: 'services', localField: '_id', foreignField: '_id', as: 'service' } },
        { $unwind: '$service' },
        { $project: { name: '$service.name', category: '$service.category', count: 1, revenue: 1 } }
      ]),
      Appointment.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: '$employeeId', count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } },
        { $sort: { count: -1 } },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'emp' } },
        { $unwind: '$emp' },
        { $project: { name: '$emp.name', employeeId: '$emp.employeeId', count: 1, revenue: 1 } }
      ])
    ]);

    res.json({
      dailyRevenue: dailyRevenue[0]?.total || 0,
      monthlyBookings,
      topServices,
      staffPerformance
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Service demand analysis (mock: by category count)
exports.serviceDemand = async (req, res) => {
  try {
    const data = await Appointment.aggregate([
      { $match: { status: { $nin: ['cancelled'] } } },
      { $lookup: { from: 'services', localField: 'serviceId', foreignField: '_id', as: 's' } },
      { $unwind: '$s' },
      { $group: { _id: '$s.category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Peak hour detection (by slot)
exports.peakHours = async (req, res) => {
  try {
    const data = await Appointment.aggregate([
      { $match: { status: { $nin: ['cancelled'] } } },
      { $group: { _id: '$slotStart', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Time prediction: suggested next slot (simple: next available slot)
exports.timePrediction = async (req, res) => {
  try {
    const { date, employeeId } = req.query;
    const TimeSlot = require('../models/TimeSlot');
    const slots = await TimeSlot.find({ isActive: true }).sort({ startTime: 1 });
    const booked = await Appointment.find({
      employeeId,
      date: new Date(date),
      status: { $nin: ['cancelled'] }
    }).select('slotStart slotEnd');
    const bookedSet = new Set(booked.map(b => `${b.slotStart}-${b.slotEnd}`));
    const firstAvailable = slots.find(s => !bookedSet.has(`${s.startTime}-${s.endTime}`));
    res.json({ suggestedSlot: firstAvailable || null });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
