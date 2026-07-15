const Event = require('../models/Event');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const cacheService = require('../services/cacheService');
const eventProducer = require('../kafka/producers/eventProducer');
const registrationProducer = require('../kafka/producers/registrationProducer');

// @desc    Get all events
// @route   GET /api/events
// @access  Public
exports.getEvents = async (req, res) => {
  try {
    const { type, institutionType, college, status, search } = req.query;
    
    let query = {};
    
    if (type) query.type = type;
    if (institutionType) query.institutionType = institutionType;
    if (college) query.college = new RegExp(college, 'i');
    if (status) query.status = status;
    else query.status = 'approved'; // Only show approved events by default
    
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { type: new RegExp(search, 'i') },
        { college: new RegExp(search, 'i') }
      ];
    }

    const events = await Event.find(query)
      .populate('createdBy', 'name email')
      .sort({ date: 1 });

    res.status(200).json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name email college')
      .populate('registeredUsers', 'name email');

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Increment view count
    await Event.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    res.status(200).json({
      success: true,
      event
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get events by college
// @route   GET /api/events/college/:collegeName
// @access  Public
exports.getEventsByCollege = async (req, res) => {
  try {
    const collegeName = req.params.collegeName.replace(/-/g, ' ');
    
    const events = await Event.find({ 
      college: new RegExp(collegeName, 'i'),
      status: 'approved'
    }).sort({ date: 1 });

    res.status(200).json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get events by institution type
// @route   GET /api/events/institution/:institutionType
// @access  Public
exports.getEventsByInstitution = async (req, res) => {
  try {
    const events = await Event.find({ 
      institutionType: req.params.institutionType.toUpperCase(),
      status: 'approved'
    }).sort({ date: 1 });

    res.status(200).json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private
exports.createEvent = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    req.body.createdBy = req.user.id;
    
    const event = await Event.create(req.body);

    // Invalidate caches (lists, college, institution, user stats)
    await cacheService.invalidateEventData(null, event.college, event.institutionType, req.user.id);

    // Publish event.created to Kafka (fire-and-forget)
    eventProducer.publishEventCreated(event, req.user.id).catch(err => {
      console.error('[CreateEvent] Kafka publish error:', err.message);
    });

    res.status(201).json({
      success: true,
      event
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private
exports.updateEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Check if user is event owner or admin
    if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this event' });
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Invalidate event detail, list, college, and user stats cache
    await cacheService.invalidateEventData(event._id, event.college, event.institutionType, event.createdBy.toString());

    // Publish event.updated to Kafka (fire-and-forget)
    eventProducer.publishEventUpdated(event, req.user.id).catch(err => {
      console.error('[UpdateEvent] Kafka publish error:', err.message);
    });

    res.status(200).json({
      success: true,
      event
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Check if user is event owner or admin
    if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this event' });
    }

    await event.deleteOne();

    // Invalidate event, lists, college, and user stats cache
    await cacheService.invalidateEventData(event._id, event.college, event.institutionType, event.createdBy.toString());

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Register for event
// @route   POST /api/events/:id/register
// @access  Private
exports.registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Check if already registered
    if (event.registeredUsers.includes(req.user.id)) {
      return res.status(400).json({ success: false, message: 'Already registered for this event' });
    }

    event.registeredUsers.push(req.user.id);
    await event.save();

    // Add to user's registered events
    const user = await User.findByIdAndUpdate(req.user.id, {
      $push: { registeredEvents: event._id }
    }, { new: true }).select('name email');

    // Invalidate event cache, lists, and registering/creator stats
    await cacheService.invalidateEventData(event._id, event.college, event.institutionType, event.createdBy.toString());
    await cacheService.invalidateUserStats(req.user.id);

    // Publish registration.created to Kafka (fire-and-forget)
    registrationProducer.publishRegistrationCreated(
      event, req.user.id, user?.name, user?.email
    ).catch(err => {
      console.error('[RegisterEvent] Kafka publish error:', err.message);
    });

    res.status(200).json({
      success: true,
      message: 'Successfully registered for event'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Unregister from event
// @route   POST /api/events/:id/unregister
// @access  Private
exports.unregisterFromEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Check if registered
    if (!event.registeredUsers.includes(req.user.id)) {
      return res.status(400).json({ success: false, message: 'Not registered for this event' });
    }

    event.registeredUsers = event.registeredUsers.filter(
      userId => userId.toString() !== req.user.id
    );
    await event.save();

    // Remove from user's registered events
    const user = await User.findByIdAndUpdate(req.user.id, {
      $pull: { registeredEvents: event._id }
    }, { new: true }).select('name');

    // Invalidate cache
    await cacheService.invalidateEventData(event._id, event.college, event.institutionType, event.createdBy.toString());
    await cacheService.invalidateUserStats(req.user.id);

    // Publish registration.cancelled to Kafka (fire-and-forget)
    registrationProducer.publishRegistrationCancelled(
      event, req.user.id, user?.name
    ).catch(err => {
      console.error('[UnregisterEvent] Kafka publish error:', err.message);
    });

    res.status(200).json({
      success: true,
      message: 'Successfully unregistered from event'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Approve event
// @route   PUT /api/events/:id/approve
// @access  Private (Admin)
exports.approveEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    event.status = 'approved';
    await event.save();

    // Invalidate cache
    await cacheService.invalidateEventData(event._id, event.college, event.institutionType, event.createdBy.toString());

    // ── Publish event.approved to Kafka ──
    // Replaces the inline notificationService.notifyOnEventApproval() call.
    // Email, notification, and analytics consumers process this asynchronously.
    eventProducer.publishEventApproved(event).catch(err => {
      console.error('[ApproveEvent] Kafka publish error:', err.message);
    });

    res.status(200).json({
      success: true,
      message: 'Event approved successfully',
      event
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Reject event
// @route   PUT /api/events/:id/reject
// @access  Private (Admin)
exports.rejectEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    event.status = 'rejected';
    await event.save();

    // Invalidate cache
    await cacheService.invalidateEventData(event._id, event.college, event.institutionType, event.createdBy.toString());

    // Publish event.rejected to Kafka (fire-and-forget)
    eventProducer.publishEventRejected(event).catch(err => {
      console.error('[RejectEvent] Kafka publish error:', err.message);
    });

    res.status(200).json({
      success: true,
      message: 'Event rejected',
      event
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};