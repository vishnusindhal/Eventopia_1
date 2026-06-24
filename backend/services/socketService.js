const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let io = null;

// Map of userId -> Set of socket IDs (supports multiple tabs/devices)
const onlineUsers = new Map();

/**
 * Initialize Socket.IO on the given HTTP server.
 * @param {import('http').Server} httpServer
 * @param {string[]} allowedOrigins – CORS origins from server config
 */
function init(httpServer, allowedOrigins) {
  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingInterval: 25000,
    pingTimeout: 60000
  });

  // ── Authentication middleware ────────────────────────────────
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('_id name email role');
      if (!user) return next(new Error('User not found'));

      socket.userId = user._id.toString();
      socket.userData = user;
      next();
    } catch (err) {
      next(new Error('Authentication failed'));
    }
  });

  // ── Connection handler ───────────────────────────────────────
  io.on('connection', (socket) => {
    const userId = socket.userId;
    console.log(`[Socket] User connected: ${userId} (socket ${socket.id})`);

    // Join a personal room so we can emit to this user from anywhere
    socket.join(`user:${userId}`);

    // Track online users
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    // ── Disconnect ─────────────────────────────────────────────
    socket.on('disconnect', () => {
      console.log(`[Socket] User disconnected: ${userId} (socket ${socket.id})`);
      const sockets = onlineUsers.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) onlineUsers.delete(userId);
      }
    });
  });

  console.log('[Socket] Socket.IO initialized');
  return io;
}

/**
 * Get the Socket.IO instance (must be called after init).
 */
function getIO() {
  if (!io) throw new Error('Socket.IO not initialized – call init() first');
  return io;
}

/**
 * Send a notification to a specific user (across all their connected devices).
 * @param {string} userId
 * @param {object} notification – the notification document (or plain object)
 */
function sendToUser(userId, notification) {
  if (!io) return;
  io.to(`user:${userId}`).emit('new-notification', notification);
}

/**
 * Check if a user is currently online.
 * @param {string} userId
 * @returns {boolean}
 */
function isUserOnline(userId) {
  return onlineUsers.has(userId);
}

module.exports = { init, getIO, sendToUser, isUserOnline };
