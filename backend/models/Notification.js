const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  },
  type: {
    type: String,
    enum: ['new_event', 'deadline_reminder', 'event_update', 'event_cancelled', 'registration_reminder', 'system'],
    default: 'new_event'
  },
  read: {
    type: Boolean,
    default: false
  },
  actionUrl: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for fast user-notification queries sorted by date
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, createdAt: -1 });

// TTL index: auto-delete notifications older than 90 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = mongoose.model('Notification', notificationSchema);
