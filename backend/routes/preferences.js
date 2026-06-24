const express = require('express');
const router = express.Router();
const preferencesController = require('../controllers/preferencesController');
const { protect } = require('../middleware/auth');

// @route   GET /api/preferences
// @desc    Get user's notification preferences
// @access  Private
router.get('/', protect, preferencesController.getPreferences);

// @route   PATCH /api/preferences
// @desc    Update user's notification preferences
// @access  Private
router.patch('/', protect, preferencesController.updatePreferences);

module.exports = router;
