const Notification = require('../models/Notification');
const User = require('../models/User');
const emailService = require('./emailService');
const socketService = require('./socketService');

/**
 * Called when an event is approved. Finds all matching subscribers,
 * creates in-app notifications, sends emails, and emits socket events.
 *
 * @param {object} event – the approved Event document (populated or plain)
 */
async function notifyOnEventApproval(event) {
  try {
    const matchingUsers = await findMatchingSubscribers(event);

    if (matchingUsers.length === 0) {
      console.log(`[NotificationService] No subscribers matched for event "${event.title}"`);
      return;
    }

    console.log(`[NotificationService] ${matchingUsers.length} subscriber(s) matched for "${event.title}"`);

    const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').split(',')[0].trim();
    const actionUrl = `/event/${event._id}`;

    // Build notification documents in bulk
    const notifications = matchingUsers.map(user => ({
      userId: user._id,
      title: `New ${event.type} at ${event.college}`,
      message: `"${event.title}" has been published. Check it out!`,
      eventId: event._id,
      type: 'new_event',
      actionUrl
    }));

    // Insert all at once for performance
    const created = await Notification.insertMany(notifications, { ordered: false });
    console.log(`[NotificationService] Created ${created.length} in-app notifications`);

    // Deliver real-time socket events and emails concurrently
    const deliveryPromises = matchingUsers.map(async (user, i) => {
      const notifDoc = created[i];

      // Socket delivery (instant – no await needed, fire-and-forget)
      if (user.notificationPreferences?.inAppEnabled !== false) {
        socketService.sendToUser(user._id.toString(), {
          _id: notifDoc._id,
          title: notifDoc.title,
          message: notifDoc.message,
          type: notifDoc.type,
          eventId: event._id,
          actionUrl: notifDoc.actionUrl,
          read: false,
          createdAt: notifDoc.createdAt
        });
      }

      // Email delivery (only if user has email notifications enabled and instant alerts on)
      if (
        user.notificationPreferences?.emailEnabled !== false &&
        user.notificationPreferences?.instantAlerts !== false
      ) {
        await emailService.sendEventNotification(user.email, event);
      }
    });

    await Promise.allSettled(deliveryPromises);

    // Update event subscriberCount
    await event.constructor.findByIdAndUpdate(event._id, {
      $inc: { subscriberCount: matchingUsers.length }
    });
  } catch (err) {
    console.error('[NotificationService] Error in notifyOnEventApproval:', err);
  }
}

/**
 * Find all users whose subscriptions match the given event.
 *
 * Matching logic:
 * 1. User subscribed to the specific institute (college name) OR
 * 2. User subscribed to the institution type (IIT/NIT/IIIT) OR
 * 3. User enabled "subscribeAllInstitutes"
 *
 * AND at least one of:
 * a. User has no category filters (receives all categories) OR
 * b. Event category matches one of the user's subscribed categories
 */
async function findMatchingSubscribers(event) {
  const { college, institutionType, type } = event;

  // Build the institute/type OR condition
  const instituteConditions = [
    { 'subscriptions.subscribeAllInstitutes': true }
  ];

  if (college) {
    instituteConditions.push({ 'subscriptions.institutes': college });
  }

  if (institutionType) {
    instituteConditions.push({ 'subscriptions.institutionTypes': institutionType });
  }

  // Category matching: users with empty categories array should receive all
  const categoryConditions = [
    { 'subscriptions.categories': { $size: 0 } },  // no filters = receive all
    { 'subscriptions.categories': { $exists: false } }
  ];

  if (type) {
    categoryConditions.push({ 'subscriptions.categories': type });
  }

  const users = await User.find({
    role: { $ne: 'admin' },
    $or: instituteConditions,
    $and: [{ $or: categoryConditions }]
  }).select('_id email name notificationPreferences');

  return users;
}

/**
 * Create a single notification for a specific user.
 */
async function createNotification({ userId, title, message, eventId, type = 'system', actionUrl = '' }) {
  try {
    const notification = await Notification.create({
      userId, title, message, eventId, type, actionUrl
    });

    // Real-time delivery
    socketService.sendToUser(userId.toString(), {
      _id: notification._id,
      title, message, type, eventId, actionUrl,
      read: false,
      createdAt: notification.createdAt
    });

    return notification;
  } catch (err) {
    console.error('[NotificationService] createNotification error:', err);
    return null;
  }
}

module.exports = { notifyOnEventApproval, findMatchingSubscribers, createNotification };
