const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// @route   GET /api/users/events
// @desc    Get user's submitted events
// @access  Private
router.get('/events', protect, userController.getUserEvents);

// @route   GET /api/users/registered-events
// @desc    Get user's registered events
// @access  Private
router.get('/registered-events', protect, userController.getRegisteredEvents);

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', protect, userController.getUserStats);

module.exports = router;