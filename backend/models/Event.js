const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide event title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide event description']
  },
  type: {
    type: String,
    required: [true, 'Please provide event type'],
    enum: [
      'Technical', 'Cultural', 'Hackathon', 'Workshop', 'Seminar', 'Sports',
      'Webinar', 'Competition', 'Internship', 'Placement Drive',
      'Tech Fest', 'Cultural Fest', 'Sports Event', 'Coding Contest',
      'Research Program', 'Open Source Program', 'Scholarship'
    ]
  },
  college: {
    type: String,
    required: [true, 'Please provide college name']
  },
  institutionType: {
    type: String,
    required: [true, 'Please provide institution type'],
    enum: ['IIIT', 'NIT', 'IIT', 'Other']
  },
  date: {
    type: Date,
    required: [true, 'Please provide event date']
  },
  endDate: {
    type: Date
  },
  venue: {
    type: String,
    required: [true, 'Please provide venue']
  },
  organizer: {
    type: String,
    required: [true, 'Please provide organizer name']
  },
  contact: {
    type: String,
    required: [true, 'Please provide contact email'],
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  registrationLink: {
    type: String
  },
  image: {
    type: String,
    default: 'https://via.placeholder.com/800x400'
  },
  highlights: [{
    type: String
  }],
  schedule: [{
    time: String,
    activity: String
  }],
  registrationDeadline: {
    type: Date
  },
  capacity: {
    type: Number,
    default: null,
    min: [1, 'Capacity must be at least 1'],
    validate: {
      validator: value => value === null || value === undefined || Number.isInteger(value),
      message: 'Capacity must be a whole number'
    }
  },
  registrationCount: {
    type: Number,
    default: 0,
    min: 0
  },
  views: {
    type: Number,
    default: 0
  },
  subscriberCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  registeredUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
eventSchema.index({ college: 1, date: 1 });
eventSchema.index({ institutionType: 1 });
eventSchema.index({ type: 1 });
eventSchema.index({ status: 1, capacity: 1, registrationCount: 1 });

module.exports = mongoose.model('Event', eventSchema);