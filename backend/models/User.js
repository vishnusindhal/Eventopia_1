const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  college: {
    type: String,
    required: [true, 'Please provide your college name']
  },
  institutionType: {
    type: String,
    enum: ['IIIT', 'NIT', 'IIT', 'Other'],
    default: 'Other'
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  registeredEvents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }],

  // ── Subscription Settings ──────────────────────────────────
  subscriptions: {
    institutes: { type: [String], default: [] },          // e.g. ["IIIT Surat", "IIT Bombay"]
    institutionTypes: { type: [String], default: [] },     // e.g. ["IIT", "NIT", "IIIT"]
    categories: { type: [String], default: [] },           // e.g. ["Hackathon", "Workshop"]
    subscribeAllInstitutes: { type: Boolean, default: false }
  },

  // ── Notification Preferences ───────────────────────────────
  notificationPreferences: {
    emailEnabled: { type: Boolean, default: true },
    inAppEnabled: { type: Boolean, default: true },
    dailyDigest: { type: Boolean, default: false },
    weeklyDigest: { type: Boolean, default: false },
    instantAlerts: { type: Boolean, default: true }
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for efficient subscription matching
userSchema.index({ 'subscriptions.institutes': 1 });
userSchema.index({ 'subscriptions.institutionTypes': 1 });
userSchema.index({ 'subscriptions.categories': 1 });
userSchema.index({ 'subscriptions.subscribeAllInstitutes': 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);