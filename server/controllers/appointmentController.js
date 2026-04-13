/**
 * Appointment CRUD – Booking flow, status updates, real-time emit
 */
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Service = require('../models/Service');
const { emitAppointmentUpdate } = require('../config/socket');
const { sendBookingEmail, sendInvoiceEmail } = require('../utils/emailService');
const { generateInvoicePDF } = require('../utils/pdfService');
const { createNotification } = require('./notificationController');

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
      .sort({ date: 1, startTime: 1 });
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
    const { employeeId, serviceId, date, startTime, paymentMethod, products } = req.body;
    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    const duration = service.duration || 30;

    // Parse startTime to minutes
    const [h, m] = startTime.split(':').map(Number);
    const newStartMins = h * 60 + m;
    const newEndMins = newStartMins + duration;

    // Calculate endTime
    const endH = Math.floor(newEndMins / 60).toString().padStart(2, '0');
    const endM = (newEndMins % 60).toString().padStart(2, '0');
    const endTime = `${endH}:${endM}`;

    // Overlap validation
    const startOfDay = new Date(date);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const existingAppointments = await Appointment.find({
      employeeId,
      date: { $gte: startOfDay, $lt: endOfDay },
      status: { $nin: ['cancelled'] }
    });

    for (let apt of existingAppointments) {
      if (!apt.startTime || !apt.endTime) continue;
      const [exH, exM] = apt.startTime.split(':').map(Number);
      const exStartMins = exH * 60 + exM;

      const [eyH, eyM] = apt.endTime.split(':').map(Number);
      const exEndMins = eyH * 60 + eyM;

      if (newStartMins < exEndMins && newEndMins > exStartMins) {
        return res.status(400).json({ message: 'This employee is already booked during the selected time slot.' });
      }
    }

    const amount = service.price;
    const gstPercent = 18;
    let productsAmount = 0;
    let productsList = [];
    if (products && Array.isArray(products) && products.length > 0) {
      productsList = products.map(p => ({
        ...p,
        price: Number(p.price) || 0,
        quantity: Number(p.quantity) || 1
      }));
      productsAmount = productsList.reduce((acc, p) => acc + (p.price * p.quantity), 0);
    }
    const gstAmount = Math.round((amount + productsAmount) * (gstPercent / 100));
    const discount = 0; // Hardcoded or from request
    const convenienceFee = paymentMethod === 'Card' ? 50 : 0;
    const totalAmount = amount + productsAmount + gstAmount + convenienceFee - discount;
    const invoiceNumber = await nextInvoiceNumber();

    const appointment = await Appointment.create({
      clientId: req.user._id,
      employeeId,
      serviceId,
      products: productsList,
      date: new Date(date),
      startTime,
      endTime,
      duration,
      amount,
      gstPercent,
      gstAmount,
      discount,
      convenienceFee,
      totalAmount,
      invoiceNumber,
      paymentMethod: paymentMethod || 'Cash',
      paymentStatus: paymentMethod === 'Cash' ? 'pending' : 'paid'
    });

    const populated = await Appointment.findById(appointment._id)
      .populate('clientId', 'name email phone')
      .populate('employeeId', 'name email employeeId')
      .populate('serviceId', 'name category duration price');

    emitAppointmentUpdate({ type: 'created', appointment: populated });

    // --- NOTIFICATIONS ---
    // Notify employee
    createNotification(employeeId, `New appointment booked for ${new Date(date).toLocaleDateString()} at ${startTime}`, 'booking');
    
    // Notify owner (assuming we can find owners, let's just trigger for employee for now, or fetch owners)
    User.find({ role: 'owner' }).then(owners => {
      owners.forEach(owner => {
        createNotification(owner._id, `New appointment booked by ${populated.clientId?.name} with ${populated.employeeId?.name}`, 'booking');
      });
    }).catch(err => console.error(err));
    // -----------------------

    // Background Email Logic (Booking Confirmation Only)
    (async () => {
      try {
        const clientEmail = populated.clientId?.email;
        if (clientEmail) {
          const emailData = {
            serviceName: populated.serviceId?.name || 'Service',
            date: populated.date,
            time: populated.startTime,
            employeeName: populated.employeeId?.name || 'Employee'
          };
          
          await sendBookingEmail(clientEmail, emailData);
        }
      } catch (error) {
        console.error('Error sending booking confirmation email:', error);
      }
    })();

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

    const allowed = ['status', 'date', 'startTime', 'endTime', 'rating', 'feedback'];
    const updates = {};
    Object.keys(req.body).forEach(k => { if (allowed.includes(k)) updates[k] = req.body[k]; });

    // Inventory Deduction Logic
    if (updates.status === 'completed' && apt.status !== 'completed') {
      const ServiceConsumable = require('../models/ServiceConsumable');
      const Inventory = require('../models/Inventory');

      const consumables = await ServiceConsumable.find({ serviceId: apt.serviceId });
      for (const consumable of consumables) {
        await Inventory.findByIdAndUpdate(consumable.productId, {
          $inc: { totalStock: -consumable.quantityUsed }
        });

        // Optionally check low stock and emit socket event
        const inv = await Inventory.findById(consumable.productId);
        if (inv && inv.totalStock <= inv.lowStockThreshold) {
          emitAppointmentUpdate({ type: 'inventory_alert', inventory: inv });
        }
      }
    }

    const updated = await Appointment.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate('clientId', 'name email phone')
      .populate('employeeId', 'name email employeeId')
      .populate('serviceId', 'name category duration price');

    emitAppointmentUpdate({ type: 'updated', appointment: updated });

    // --- NOTIFICATIONS ---
    if (updates.status === 'completed' && apt.status !== 'completed') {
      createNotification(updated.clientId._id || updated.clientId, `Your service with ${updated.employeeId?.name} is completed. Please consider leaving a review.`, 'service');
    } else if (updates.status && updates.status !== apt.status) {
      if (req.user.role === 'client') {
         createNotification(updated.employeeId._id || updated.employeeId, `Appointment status updated to ${updates.status} by client.`, 'booking');
      } else {
         createNotification(updated.clientId._id || updated.clientId, `Your appointment status was updated to ${updates.status}.`, 'booking');
      }
    }
    // -----------------------

    // Background Email & Invoice Logic for Completed Appointment
    if (updates.status === 'completed' && apt.status !== 'completed') {
      (async () => {
        try {
          const clientEmail = updated.clientId?.email;
          if (clientEmail) {
            const invoiceData = {
              invoiceNumber: updated.invoiceNumber,
              date: updated.date,
              time: updated.startTime,
              customerName: updated.clientId?.name || 'Customer',
              employeeName: updated.employeeId?.name || 'Employee',
              serviceName: updated.serviceId?.name || 'Service',
              products: updated.products || [],
              amount: updated.amount,
              gstAmount: updated.gstAmount,
              totalAmount: updated.totalAmount
            };

            const pdfPath = await generateInvoicePDF(invoiceData);
            
            // Save invoice path in the database
            await Appointment.findByIdAndUpdate(updated._id, { invoicePath: pdfPath });
            
            await sendInvoiceEmail(clientEmail, pdfPath, updated._id);
          }
        } catch (error) {
          console.error('Error generating/sending completion invoice:', error);
        }
      })();
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET available slots for a date + employee
exports.getAvailableSlots = async (req, res) => {
  try {
    const { date, employeeId, serviceId } = req.query;
    if (!date || !employeeId) return res.status(400).json({ message: 'date and employeeId required' });

    const Service = require('../models/Service');
    let serviceDuration = 30; // Default
    if (serviceId) {
      const service = await Service.findById(serviceId);
      if (service) serviceDuration = service.duration;
    }

    // Check for approved leaves
    const Leave = require('../models/Leave');
    const startOfDay = new Date(date);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const leaves = await Leave.find({
      employeeId,
      status: 'approved',
      startDate: { $lt: endOfDay },
      endDate: { $gte: startOfDay }
    });
    if (leaves.length > 0) {
      return res.json([]); // Return empty slots if employee is on approved leave
    }

    const booked = await Appointment.find({
      employeeId,
      date: { $gte: startOfDay, $lt: endOfDay },
      status: { $nin: ['cancelled'] }
    }).select('startTime endTime');

    const bookedIntervals = booked.map(b => {
      const [sh, sm] = (b.startTime || '00:00').split(':').map(Number);
      const [eh, em] = (b.endTime || '00:00').split(':').map(Number);
      return { start: sh * 60 + sm, end: eh * 60 + em };
    });

    const workStart = 9 * 60; // 09:00
    const workEnd = 18 * 60; // 18:00
    const interval = 30; // 30 min intervals

    const availableSlots = [];
    for (let time = workStart; time + serviceDuration <= workEnd; time += interval) {
      const newStart = time;
      const newEnd = time + serviceDuration;

      const isOverlap = bookedIntervals.some(b => newStart < b.end && newEnd > b.start);
      if (!isOverlap) {
        const h = Math.floor(newStart / 60).toString().padStart(2, '0');
        const m = (newStart % 60).toString().padStart(2, '0');
        const eh = Math.floor(newEnd / 60).toString().padStart(2, '0');
        const em = (newEnd % 60).toString().padStart(2, '0');
        availableSlots.push({ _id: `${h}:${m}`, startTime: `${h}:${m}`, endTime: `${eh}:${em}` });
      }
    }

    res.json(availableSlots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/invoice/:appointmentId
exports.downloadInvoice = async (req, res) => {
  try {
    const apt = await Appointment.findById(req.params.appointmentId);
    if (!apt) return res.status(404).json({ message: 'Appointment not found' });
    
    // Allow owner, or employee/client related to the appointment
    if (req.user.role === 'client' && apt.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    if (req.user.role === 'employee' && apt.employeeId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (!apt.invoicePath) {
      return res.status(404).json({ message: 'Invoice not generated for this appointment' });
    }

    const fs = require('fs');
    if (!fs.existsSync(apt.invoicePath)) {
      return res.status(404).json({ message: 'Invoice file not found on server' });
    }

    res.download(apt.invoicePath);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/feedback/:appointmentId
exports.submitFeedback = async (req, res) => {
  try {
    const apt = await Appointment.findById(req.params.appointmentId);
    if (!apt) return res.status(404).json({ message: 'Appointment not found' });
    
    // Only client of that appointment can submit feedback
    if (req.user.role !== 'client' || apt.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the client can submit feedback' });
    }

    if (apt.status !== 'completed') {
      return res.status(400).json({ message: 'Can only submit feedback for completed appointments' });
    }

    if (apt.isRated) {
      return res.status(400).json({ message: 'Feedback already submitted for this appointment' });
    }

    const { rating, feedback } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Invalid rating. Must be between 1 and 5' });
    }

    apt.rating = rating;
    apt.feedback = feedback;
    apt.isRated = true;
    await apt.save();

    res.json({ message: 'Feedback submitted successfully', appointment: apt });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
