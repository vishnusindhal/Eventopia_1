const User = require('../models/User');

// @desc    Get user's notification preferences
// @route   GET /api/preferences
// @access  Private
exports.getPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('notificationPreferences');

    res.status(200).json({
      success: true,
      preferences: user.notificationPreferences || {
        emailEnabled: true,
        inAppEnabled: true,
        dailyDigest: false,
        weeklyDigest: false,
        instantAlerts: true
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update user's notification preferences
// @route   PATCH /api/preferences
// @access  Private
exports.updatePreferences = async (req, res) => {
  try {
    const { emailEnabled, inAppEnabled, dailyDigest, weeklyDigest, instantAlerts } = req.body;

    const updateData = {};

    if (typeof emailEnabled === 'boolean') updateData['notificationPreferences.emailEnabled'] = emailEnabled;
    if (typeof inAppEnabled === 'boolean') updateData['notificationPreferences.inAppEnabled'] = inAppEnabled;
    if (typeof dailyDigest === 'boolean') updateData['notificationPreferences.dailyDigest'] = dailyDigest;
    if (typeof weeklyDigest === 'boolean') updateData['notificationPreferences.weeklyDigest'] = weeklyDigest;
    if (typeof instantAlerts === 'boolean') updateData['notificationPreferences.instantAlerts'] = instantAlerts;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true }
    ).select('notificationPreferences');

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      preferences: user.notificationPreferences
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
