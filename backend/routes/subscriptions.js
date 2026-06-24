const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { protect } = require('../middleware/auth');

// @route   GET /api/subscriptions
// @desc    Get user's subscriptions
// @access  Private
router.get('/', protect, subscriptionController.getSubscriptions);

// @route   POST /api/subscriptions/update
// @desc    Update user's subscriptions
// @access  Private
router.post('/update', protect, subscriptionController.updateSubscriptions);

module.exports = router;
