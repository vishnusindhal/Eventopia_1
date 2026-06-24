const User = require('../models/User');

// @desc    Get current user's subscriptions
// @route   GET /api/subscriptions
// @access  Private
exports.getSubscriptions = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('subscriptions');

    res.status(200).json({
      success: true,
      subscriptions: user.subscriptions || {
        institutes: [],
        institutionTypes: [],
        categories: [],
        subscribeAllInstitutes: false
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update user's subscriptions
// @route   POST /api/subscriptions/update
// @access  Private
exports.updateSubscriptions = async (req, res) => {
  try {
    const { institutes, institutionTypes, categories, subscribeAllInstitutes } = req.body;

    const updateData = {};

    if (Array.isArray(institutes)) {
      // Deduplicate
      updateData['subscriptions.institutes'] = [...new Set(institutes)];
    }
    if (Array.isArray(institutionTypes)) {
      const valid = ['IIT', 'NIT', 'IIIT', 'Other'];
      updateData['subscriptions.institutionTypes'] = [...new Set(institutionTypes.filter(t => valid.includes(t)))];
    }
    if (Array.isArray(categories)) {
      updateData['subscriptions.categories'] = [...new Set(categories)];
    }
    if (typeof subscribeAllInstitutes === 'boolean') {
      updateData['subscriptions.subscribeAllInstitutes'] = subscribeAllInstitutes;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('subscriptions');

    res.status(200).json({
      success: true,
      message: 'Subscriptions updated successfully',
      subscriptions: user.subscriptions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
