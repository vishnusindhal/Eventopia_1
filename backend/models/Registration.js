const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled'],
    default: 'confirmed'
  }
}, { timestamps: true });

registrationSchema.index({ event: 1, user: 1 }, { unique: true });
registrationSchema.index({ user: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Registration', registrationSchema);