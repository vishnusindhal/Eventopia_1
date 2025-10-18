const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const eventController = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/events
// @desc    Get all events (with filters)
// @access  Public
router.get('/', eventController.getEvents);

// @route   GET /api/events/:id
// @desc    Get single event by ID
// @access  Public
router.get('/:id', eventController.getEvent);

// @route   GET /api/events/college/:collegeName
// @desc    Get events by college name
// @access  Public
router.get('/college/:collegeName', eventController.getEventsByCollege);

// @route   GET /api/events/institution/:institutionType
// @desc    Get events by institution type (IIIT/NIT/IIT)
// @access  Public
router.get('/institution/:institutionType', eventController.getEventsByInstitution);

// @route   POST /api/events
// @desc    Create a new event
// @access  Private
router.post('/', protect, [
  body('title').notEmpty().withMessage('Event title is required'),
  body('description').notEmpty().withMessage('Event description is required'),
  body('type').notEmpty().withMessage('Event type is required'),
  body('college').notEmpty().withMessage('College name is required'),
  body('institutionType').notEmpty().withMessage('Institution type is required'),
  body('date').notEmpty().withMessage('Event date is required'),
  body('venue').notEmpty().withMessage('Venue is required'),
  body('organizer').notEmpty().withMessage('Organizer name is required'),
  body('contact').isEmail().withMessage('Valid contact email is required')
], eventController.createEvent);

// @route   PUT /api/events/:id
// @desc    Update an event
// @access  Private (Owner or Admin)
router.put('/:id', protect, eventController.updateEvent);

// @route   DELETE /api/events/:id
// @desc    Delete an event
// @access  Private (Owner or Admin)
router.delete('/:id', protect, eventController.deleteEvent);

// @route   POST /api/events/:id/register
// @desc    Register for an event
// @access  Private
router.post('/:id/register', protect, eventController.registerForEvent);

// @route   POST /api/events/:id/unregister
// @desc    Unregister from an event
// @access  Private
router.post('/:id/unregister', protect, eventController.unregisterFromEvent);

// @route   PUT /api/events/:id/approve
// @desc    Approve an event (Admin only)
// @access  Private (Admin)
router.put('/:id/approve', protect, authorize('admin'), eventController.approveEvent);

// @route   PUT /api/events/:id/reject
// @desc    Reject an event (Admin only)
// @access  Private (Admin)
router.put('/:id/reject', protect, authorize('admin'), eventController.rejectEvent);

module.exports = router;