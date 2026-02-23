/**
 * Socket.io setup for real-time appointment sync
 * When an appointment is created/updated/cancelled, all dashboards get notified
 */
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

const setupSocket = (server) => {
  io = new Server(server, {
    cors: { origin: true }
  });

  io.on('connection', (socket) => {
    // Optional: verify token from handshake for private namespaces
    socket.on('join-dashboard', (role) => {
      socket.join(role); // client | employee | owner
    });

    socket.on('disconnect', () => {});
  });

  return io;
};

// Emit to all dashboards when appointments change
const emitAppointmentUpdate = (payload) => {
  if (io) io.emit('appointment-update', payload);
};

const getIO = () => io;

module.exports = { setupSocket, emitAppointmentUpdate, getIO };
