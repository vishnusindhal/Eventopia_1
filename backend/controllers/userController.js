const User = require('../models/User');
const Event = require('../models/Event');

// @desc    Get user's submitted events
// @route   GET /api/users/events
// @access  Private
exports.getUserEvents = async (req, res) => {
  try {
    const events = await Event.find({ createdBy: req.user.id })
      .sort({ createdAt: -1 });

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

// @desc    Get user's registered events
// @route   GET /api/users/registered-events
// @access  Private
exports.getRegisteredEvents = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'registeredEvents',
        populate: {
          path: 'createdBy',
          select: 'name email'
        }
      });

    res.status(200).json({
      success: true,
      count: user.registeredEvents.length,
      events: user.registeredEvents
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private
exports.getUserStats = async (req, res) => {
  try {
    const submittedEvents = await Event.countDocuments({ createdBy: req.user.id });
    const approvedEvents = await Event.countDocuments({ 
      createdBy: req.user.id, 
      status: 'approved' 
    });
    const pendingEvents = await Event.countDocuments({ 
      createdBy: req.user.id, 
      status: 'pending' 
    });

    const user = await User.findById(req.user.id);
    const registeredEvents = user.registeredEvents.length;

    res.status(200).json({
      success: true,
      stats: {
        submittedEvents,
        approvedEvents,
        pendingEvents,
        registeredEvents
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};