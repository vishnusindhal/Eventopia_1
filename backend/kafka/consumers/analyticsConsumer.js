/**
 * Analytics Consumer — Updates event statistics and logs analytics data
 *
 * Consumer Group: eventopia-analytics-consumer
 * Subscriptions: event.approved, registration.created, registration.cancelled
 *
 * Responsibilities:
 * - Update subscriber counts after event approval notifications
 * - Log structured registration analytics
 * - Log structured cancellation analytics
 * - Invalidate related caches
 */

const { createConsumer } = require('../consumer');
const { TOPICS, CONSUMER_GROUPS } = require('../topics');
const Event = require('../../models/Event');
const { findMatchingSubscribers } = require('../../services/notificationService');
const cacheService = require('../../services/cacheService');

/**
 * Handle event.approved — Update subscriberCount with the number of matched subscribers.
 */
async function handleEventApproved(payload) {
  const { eventId } = payload;

  const event = await Event.findById(eventId);
  if (!event) {
    console.warn(`[Analytics Consumer] Event not found: ${eventId}`);
    return;
  }

  // Count matching subscribers
  const matchingUsers = await findMatchingSubscribers(event);
  const subscriberCount = matchingUsers.length;

  if (subscriberCount > 0) {
    await Event.findByIdAndUpdate(eventId, {
      $inc: { subscriberCount }
    });

    // Invalidate event detail cache since subscriberCount changed
    await cacheService.invalidateEventData(
      eventId,
      event.college,
      event.institutionType,
      event.createdBy.toString()
    );
  }

  console.log(`[Analytics Consumer] Event "${event.title}" — subscriberCount +${subscriberCount}`);
}

/**
 * Handle registration.created — Log registration analytics.
 */
async function handleRegistrationCreated(payload) {
  const { eventId, eventTitle, userId, userName, college } = payload;

  // Structured analytics log
  console.log(`[Analytics Consumer] REGISTRATION`, JSON.stringify({
    action: 'register',
    eventId,
    eventTitle,
    userId,
    userName,
    college,
    timestamp: new Date().toISOString()
  }));

  // Invalidate event detail cache (registeredUsers count changed)
  const event = await Event.findById(eventId).select('college institutionType createdBy');
  if (event) {
    await cacheService.invalidateEventData(
      eventId,
      event.college,
      event.institutionType,
      event.createdBy.toString()
    );
  }
}

/**
 * Handle registration.cancelled — Log cancellation analytics.
 */
async function handleRegistrationCancelled(payload) {
  const { eventId, eventTitle, userId, userName } = payload;

  console.log(`[Analytics Consumer] CANCELLATION`, JSON.stringify({
    action: 'cancel',
    eventId,
    eventTitle,
    userId,
    userName,
    timestamp: new Date().toISOString()
  }));

  // Invalidate event detail cache
  const event = await Event.findById(eventId).select('college institutionType createdBy');
  if (event) {
    await cacheService.invalidateEventData(
      eventId,
      event.college,
      event.institutionType,
      event.createdBy.toString()
    );
  }
}

/**
 * Initialize the analytics consumer.
 */
const initAnalyticsConsumer = async () => {
  return createConsumer(CONSUMER_GROUPS.ANALYTICS, {
    [TOPICS.EVENT_APPROVED]: handleEventApproved,
    [TOPICS.REGISTRATION_CREATED]: handleRegistrationCreated,
    [TOPICS.REGISTRATION_CANCELLED]: handleRegistrationCancelled
  });
};

module.exports = { initAnalyticsConsumer };
