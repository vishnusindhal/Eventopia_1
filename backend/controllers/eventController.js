const Event = require('../models/Event');
const { validationResult } = require('express-validator');
const cacheService = require('../services/cacheService');
const eventProducer = require('../kafka/producers/eventProducer');
const registrationProducer = require('../kafka/producers/registrationProducer');
const registrationService = require('../services/registrationService');

// Helper function to sort events: Live/Upcoming events on top, Closed/Past events at bottom
const sortEventsLiveFirst = (eventsList) => {
  const now = new Date();
  return eventsList.sort((a, b) => {
    const aDate = a.date ? new Date(a.date) : new Date(0);
    const bDate = b.date ? new Date(b.date) : new Date(0);

    // Event is closed if registration deadline has passed OR event date (or endDate) has passed
    const aClosed = (a.registrationDeadline && new Date(a.registrationDeadline) < now) ||
                    (a.endDate ? new Date(a.endDate) < now : aDate < now);
    const bClosed = (b.registrationDeadline && new Date(b.registrationDeadline) < now) ||
                    (b.endDate ? new Date(b.endDate) < now : bDate < now);

    // Live (open) events come first before closed events
    if (!aClosed && bClosed) return -1;
    if (aClosed && !bClosed) return 1;

    // If both are live: sort by soonest date first (ascending)
    if (!aClosed && !bClosed) {
      return aDate - bDate;
    }

    // If both are closed: sort by most recent date (descending)
    return bDate - aDate;
  });
};

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

    let events = await Event.find(query).populate('createdBy', 'name email');
    events = sortEventsLiveFirst(events);

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
    
    let events = await Event.find({ 
      college: new RegExp(collegeName, 'i'),
      status: 'approved'
    });
    events = sortEventsLiveFirst(events);

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
    let events = await Event.find({ 
      institutionType: req.params.institutionType.toUpperCase(),
      status: 'approved'
    });
    events = sortEventsLiveFirst(events);

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
    if (req.body.capacity !== undefined && req.body.capacity !== null && req.body.capacity !== '') {
      const capacity = Number(req.body.capacity);
      if (!Number.isInteger(capacity) || capacity < 1) {
        return res.status(400).json({ success: false, code: 'INVALID_CAPACITY', message: 'Capacity must be a positive whole number' });
      }
      req.body.capacity = capacity;
    }
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

    if (req.body.capacity !== undefined && req.body.capacity !== null && req.body.capacity !== '') {
      const capacity = Number(req.body.capacity);
      if (!Number.isInteger(capacity) || capacity < 1) {
        return res.status(400).json({ success: false, code: 'INVALID_CAPACITY', message: 'Capacity must be a positive whole number' });
      }
      const currentRegistrations = event.registrationCount ?? event.registeredUsers.length;
      if (capacity < currentRegistrations) {
        return res.status(409).json({
          success: false,
          code: 'CAPACITY_BELOW_REGISTRATIONS',
          message: `Capacity cannot be lower than the ${currentRegistrations} confirmed registrations`
        });
      }
      req.body.capacity = capacity;
    } else if (req.body.capacity === null || req.body.capacity === '') {
      req.body.capacity = null;
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
    const { event, user, registration } = await registrationService.register(req.params.id, req.user.id);

    // Invalidate event cache, lists, and registering/creator stats
    await cacheService.invalidateEventData(event._id, event.college, event.institutionType, event.createdBy.toString());
    await cacheService.invalidateUserStats(req.user.id);

    // Publish registration.created to Kafka (fire-and-forget)
    registrationProducer.publishRegistrationCreated(
      event, req.user.id, user?.name, user?.email, registration?._id
    ).catch(err => {
      console.error('[RegisterEvent] Kafka publish error:', err.message);
    });

    res.status(201).json({
      success: true,
      message: 'Successfully registered for event',
      event: {
        id: event._id,
        capacity: event.capacity,
        registrationCount: event.registrationCount,
        seatsRemaining: event.capacity === null || event.capacity === undefined
          ? null
          : Math.max(event.capacity - event.registrationCount, 0)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).json({ success: false, code: error.code, message: error.message || 'Server error' });
  }
};

// @desc    Unregister from event
// @route   POST /api/events/:id/unregister
// @access  Private
exports.unregisterFromEvent = async (req, res) => {
  try {
    const { event, user } = await registrationService.unregister(req.params.id, req.user.id);

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
    res.status(error.statusCode || 500).json({ success: false, code: error.code, message: error.message || 'Server error' });
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