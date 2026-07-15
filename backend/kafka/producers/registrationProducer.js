/**
 * Registration Producer — Publishes registration lifecycle messages to Kafka
 *
 * Used by eventController.js for registration/unregistration flows.
 */

const { publishEvent } = require('../producer');
const { TOPICS } = require('../topics');

/**
 * Publish when a student registers for an event.
 */
const publishRegistrationCreated = async (event, userId, userName, userEmail) => {
  await publishEvent(TOPICS.REGISTRATION_CREATED, event._id.toString(), {
    eventId: event._id.toString(),
    eventTitle: event.title,
    eventType: event.type,
    eventDate: event.date,
    eventVenue: event.venue || 'Online',
    college: event.college,
    organizerId: event.createdBy.toString(),
    userId,
    userName: userName || 'Student',
    userEmail: userEmail || ''
  });
};

/**
 * Publish when a student cancels their registration.
 */
const publishRegistrationCancelled = async (event, userId, userName) => {
  await publishEvent(TOPICS.REGISTRATION_CANCELLED, event._id.toString(), {
    eventId: event._id.toString(),
    eventTitle: event.title,
    college: event.college,
    organizerId: event.createdBy.toString(),
    userId,
    userName: userName || 'Student'
  });
};

module.exports = {
  publishRegistrationCreated,
  publishRegistrationCancelled
};
