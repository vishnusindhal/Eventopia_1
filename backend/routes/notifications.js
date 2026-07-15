const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');
const cacheMiddleware = require('../middleware/cacheMiddleware');

// @route   GET /api/notifications
// @desc    Get user's notifications (paginated, with search & read filter)
// @access  Private
router.get('/', protect, notificationController.getNotifications);

// @route   GET /api/notifications/unread-count
// @desc    Get unread notification count
// @access  Private
router.get('/unread-count', protect, cacheMiddleware(), notificationController.getUnreadCount);

// @route   PATCH /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.patch('/read-all', protect, notificationController.markAllAsRead);

// @route   DELETE /api/notifications/all
// @desc    Delete all notifications
// @access  Private
router.delete('/all', protect, notificationController.deleteAllNotifications);

// @route   PATCH /api/notifications/:id/read
// @desc    Mark single notification as read
// @access  Private
router.patch('/:id/read', protect, notificationController.markAsRead);

// @route   DELETE /api/notifications/:id
// @desc    Delete a notification
// @access  Private
router.delete('/:id', protect, notificationController.deleteNotification);

module.exports = router;
