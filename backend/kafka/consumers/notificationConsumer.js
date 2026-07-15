/**
 * Notification Consumer — Creates in-app notifications and emits Socket.IO events
 *
 * Consumer Group: eventopia-notification-consumer
 * Subscriptions: event.approved, registration.created, registration.cancelled
 *
 * Responsibilities:
 * - Create bulk in-app notifications for subscribers on event approval
 * - Emit real-time Socket.IO events to connected users
 * - Invalidate Redis cached unread counts
 * - Notify organizers on registration/cancellation
 */

const { createConsumer } = require('../consumer');
const { TOPICS, CONSUMER_GROUPS } = require('../topics');
const Notification = require('../../models/Notification');
const Event = require('../../models/Event');
const User = require('../../models/User');
const { findMatchingSubscribers } = require('../../services/notificationService');
const socketService = require('../../services/socketService');
const cacheService = require('../../services/cacheService');

/**
 * Handle event.approved — Create bulk in-app notifications for matching subscribers.
 * This replaces the inline notifyOnEventApproval logic that was previously called
 * synchronously in the approveEvent controller.
 */
async function handleEventApproved(payload) {
  const { eventId } = payload;

  const event = await Event.findById(eventId);
  if (!event) {
    console.warn(`[Notification Consumer] Event not found: ${eventId}`);
    return;
  }

  const matchingUsers = await findMatchingSubscribers(event);

  if (matchingUsers.length === 0) {
    console.log(`[Notification Consumer] No subscribers matched for "${event.title}"`);
    return;
  }

  console.log(`[Notification Consumer] Creating notifications for ${matchingUsers.length} subscriber(s)`);

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

  // Bulk insert for performance
  const created = await Notification.insertMany(notifications, { ordered: false });
  console.log(`[Notification Consumer] Created ${created.length} in-app notifications`);

  // Invalidate cached unread counts for all matching users in Redis
  try {
    await Promise.all(
      matchingUsers.map(user => cacheService.invalidateUnreadCount(user._id.toString()))
    );
  } catch (cacheErr) {
    console.error('[Notification Consumer] Cache invalidation error:', cacheErr.message);
  }

  // Emit real-time Socket.IO events
  matchingUsers.forEach((user, i) => {
    if (user.notificationPreferences?.inAppEnabled !== false) {
      const notifDoc = created[i];
      if (notifDoc) {
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
    }
  });
}

/**
 * Handle registration.created — Notify the event organizer.
 */
async function handleRegistrationCreated(payload) {
  const { eventId, eventTitle, organizerId, userName } = payload;

  // Create organizer notification
  const notification = await Notification.create({
    userId: organizerId,
    title: '🎟️ New Registration',
    message: `${userName} registered for "${eventTitle}"`,
    eventId,
    type: 'registration',
    actionUrl: `/event/${eventId}`
  });

  // Invalidate organizer's cached unread count
  await cacheService.invalidateUnreadCount(organizerId);

  // Real-time delivery
  socketService.sendToUser(organizerId, {
    _id: notification._id,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    eventId,
    actionUrl: notification.actionUrl,
    read: false,
    createdAt: notification.createdAt
  });

  console.log(`[Notification Consumer] Organizer ${organizerId} notified of registration`);
}

/**
 * Handle registration.cancelled — Notify the event organizer.
 */
async function handleRegistrationCancelled(payload) {
  const { eventId, eventTitle, organizerId, userName } = payload;

  const notification = await Notification.create({
    userId: organizerId,
    title: '❌ Registration Cancelled',
    message: `${userName} cancelled their registration for "${eventTitle}"`,
    eventId,
    type: 'registration',
    actionUrl: `/event/${eventId}`
  });

  await cacheService.invalidateUnreadCount(organizerId);

  socketService.sendToUser(organizerId, {
    _id: notification._id,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    eventId,
    actionUrl: notification.actionUrl,
    read: false,
    createdAt: notification.createdAt
  });

  console.log(`[Notification Consumer] Organizer ${organizerId} notified of cancellation`);
}

/**
 * Initialize the notification consumer.
 */
const initNotificationConsumer = async () => {
  return createConsumer(CONSUMER_GROUPS.NOTIFICATION, {
    [TOPICS.EVENT_APPROVED]: handleEventApproved,
    [TOPICS.REGISTRATION_CREATED]: handleRegistrationCreated,
    [TOPICS.REGISTRATION_CANCELLED]: handleRegistrationCancelled
  });
};

module.exports = { initNotificationConsumer };
