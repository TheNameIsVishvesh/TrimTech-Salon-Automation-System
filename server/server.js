/**
 * TrimTech – Salon Automation & Management System
 * Backend entry point: Express server + Socket.io for real-time sync
 */
require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const serviceRoutes = require('./routes/services');
const productRoutes = require('./routes/products');
const appointmentRoutes = require('./routes/appointments');
const userRoutes = require('./routes/users');
const reportRoutes = require('./routes/reports');
const contactRoutes = require('./routes/contact');
const timeSlotRoutes = require('./routes/timeSlots');
const leaveRoutes = require('./routes/leaves');
const notificationRoutes = require('./routes/notifications');
const { setupSocket } = require('./config/socket');

connectDB();

const app = express();
const server = http.createServer(app);

// Socket.io for real-time appointment sync
setupSocket(server);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// REST API routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/products', productRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/time-slots', timeSlotRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/analytics', require('./routes/analytics'));

// Specific requested routes
const { downloadInvoice, submitFeedback } = require('./controllers/appointmentController');
const { protect } = require('./middleware/auth');
app.get('/api/invoice/:appointmentId', protect, downloadInvoice);
app.post('/api/feedback/:appointmentId', protect, submitFeedback);

app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'TrimTech API' }));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`TrimTech server running on port ${PORT}`));
