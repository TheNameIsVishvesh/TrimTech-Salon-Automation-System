/**
 * MongoDB connection configuration
 * TrimTech – Salon Automation & Management System
 */
const mongoose = require('mongoose');

const connectDB = () => {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI missing");
    process.exit(1);
  }

  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(err => {
      console.error("MongoDB connection error:", err);
      process.exit(1);
    });
};

module.exports = connectDB;
