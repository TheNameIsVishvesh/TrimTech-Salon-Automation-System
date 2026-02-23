/**
 * Seed script – Sample services, products, time slots, users
 * Run: node scripts/seed.js (from server folder) or npm run seed from root
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Service = require('../models/Service');
const Product = require('../models/Product');
const TimeSlot = require('../models/TimeSlot');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/trimtech';

const services = [
  { name: 'Haircut', category: 'Hair', duration: 30, price: 300, description: 'Classic haircut' },
  { name: 'Hair Color', category: 'Hair', duration: 90, price: 1500, description: 'Full hair coloring' },
  { name: 'Beard Trim', category: 'Beard', duration: 20, price: 150, description: 'Beard shaping' },
  { name: 'Full Beard Groom', category: 'Beard', duration: 45, price: 400, description: 'Beard wash & style' },
  { name: 'Basic Facial', category: 'Facial', duration: 45, price: 600, description: 'Cleansing facial' },
  { name: 'Gold Facial', category: 'Facial', duration: 60, price: 1200, description: 'Premium gold facial' },
  { name: 'Head Massage', category: 'Spa', duration: 30, price: 350, description: 'Relaxing head massage' },
  { name: 'Body Massage', category: 'Spa', duration: 60, price: 800, description: 'Full body massage' },
  { name: 'Bridal Makeup', category: 'Bridal', duration: 120, price: 5000, description: 'Full bridal makeup' },
  { name: 'Bridal Hair', category: 'Bridal', duration: 90, price: 3500, description: 'Bridal hairstyling' },
  { name: 'Cleanup', category: 'Skin Care', duration: 45, price: 500, description: 'Face cleanup' },
  { name: 'Anti-Aging', category: 'Skin Care', duration: 60, price: 1800, description: 'Anti-aging treatment' }
];

const products = [
  { name: 'Shampoo Pro', category: 'Hair care', mrp: 450, discount: 50, stock: 25, lowStockThreshold: 5 },
  { name: 'Beard Oil', category: 'Grooming', mrp: 299, discount: 30, stock: 40, lowStockThreshold: 5 },
  { name: 'Face Cream', category: 'Skin care', mrp: 599, discount: 100, stock: 15, lowStockThreshold: 5 },
  { name: 'Hair Serum', category: 'Hair care', mrp: 399, discount: 0, stock: 3, lowStockThreshold: 5 },
  { name: 'Sunscreen', category: 'Skin care', mrp: 349, discount: 49, stock: 30, lowStockThreshold: 5 }
];

const timeSlots = [
  { startTime: '09:00', endTime: '09:30', label: 'Morning' },
  { startTime: '09:30', endTime: '10:00', label: 'Morning' },
  { startTime: '10:00', endTime: '10:30', label: 'Morning' },
  { startTime: '10:30', endTime: '11:00', label: 'Morning' },
  { startTime: '11:00', endTime: '11:30', label: 'Late Morning' },
  { startTime: '11:30', endTime: '12:00', label: 'Late Morning' },
  { startTime: '12:00', endTime: '12:30', label: 'Afternoon' },
  { startTime: '12:30', endTime: '13:00', label: 'Afternoon' },
  { startTime: '14:00', endTime: '14:30', label: 'Afternoon' },
  { startTime: '14:30', endTime: '15:00', label: 'Afternoon' },
  { startTime: '15:00', endTime: '15:30', label: 'Evening' },
  { startTime: '15:30', endTime: '16:00', label: 'Evening' },
  { startTime: '16:00', endTime: '16:30', label: 'Evening' },
  { startTime: '16:30', endTime: '17:00', label: 'Evening' },
  { startTime: '17:00', endTime: '17:30', label: 'Evening' },
  { startTime: '17:30', endTime: '18:00', label: 'Evening' }
];

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  await Service.deleteMany({});
  await Service.insertMany(services);
  console.log('Services seeded');

  await Product.deleteMany({});
  await Product.insertMany(products);
  console.log('Products seeded');

  await TimeSlot.deleteMany({});
  await TimeSlot.insertMany(timeSlots);
  console.log('Time slots seeded');

  const existingOwner = await User.findOne({ email: 'owner@trimtech.com' });
  if (!existingOwner) {
    await User.create({
      name: 'TrimTech Owner',
      email: 'owner@trimtech.com',
      password: 'owner123',
      role: 'owner',
      phone: '9876543210'
    });
    console.log('Owner created: owner@trimtech.com / owner123');
  }

  const serviceIds = (await Service.find().select('_id')).map(s => s._id);
  const existingEmp = await User.findOne({ email: 'emp1@trimtech.com' });
  if (!existingEmp) {
    await User.create({
      name: 'Rahul Kumar',
      email: 'emp1@trimtech.com',
      password: 'emp123',
      role: 'employee',
      phone: '9876543211',
      employeeId: 'EMP001',
      assignedServiceIds: serviceIds.slice(0, 6),
      status: 'available'
    });
    await User.create({
      name: 'Priya Sharma',
      email: 'emp2@trimtech.com',
      password: 'emp123',
      role: 'employee',
      phone: '9876543212',
      employeeId: 'EMP002',
      assignedServiceIds: serviceIds.slice(6, 12),
      status: 'available'
    });
    console.log('Employees created: emp1@trimtech.com, emp2@trimtech.com / emp123');
  }

  const existingClient = await User.findOne({ email: 'client@trimtech.com' });
  if (!existingClient) {
    await User.create({
      name: 'Amit Singh',
      email: 'client@trimtech.com',
      password: 'client123',
      role: 'client',
      phone: '9876543220'
    });
    console.log('Client created: client@trimtech.com / client123');
  }

  await mongoose.disconnect();
  console.log('Seed complete.');
}

seed().catch(err => { console.error(err); process.exit(1); });
