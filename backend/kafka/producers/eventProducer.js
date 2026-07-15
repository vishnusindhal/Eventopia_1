/**
 * Event Producer — Publishes event lifecycle messages to Kafka
 *
 * Used by eventController.js to fire-and-forget background tasks
 * after MongoDB writes complete.
 */

const { publishEvent } = require('../producer');
const { TOPICS } = require('../topics');

/**
 * Publish when a new event is created (status: pending).
 */
const publishEventCreated = async (event, userId) => {
  await publishEvent(TOPICS.EVENT_CREATED, event._id.toString(), {
    eventId: event._id.toString(),
    title: event.title,
    type: event.type,
    college: event.college,
    institutionType: event.institutionType,
    createdBy: userId,
    status: event.status
  });
};

/**
 * Publish when an event is updated.
 */
const publishEventUpdated = async (event, userId) => {
  await publishEvent(TOPICS.EVENT_UPDATED, event._id.toString(), {
    eventId: event._id.toString(),
    title: event.title,
    type: event.type,
    college: event.college,
    institutionType: event.institutionType,
    updatedBy: userId,
    status: event.status
  });
};

/**
 * Publish when an event is approved by admin.
 * This is the primary decoupling point — replaces the inline
 * notificationService.notifyOnEventApproval() call.
 */
const publishEventApproved = async (event) => {
  await publishEvent(TOPICS.EVENT_APPROVED, event._id.toString(), {
    eventId: event._id.toString(),
    title: event.title,
    type: event.type,
    college: event.college,
    institutionType: event.institutionType,
    venue: event.venue || 'Online',
    date: event.date,
    createdBy: event.createdBy.toString(),
    contact: event.contact
  });
};

/**
 * Publish when an event is rejected by admin.
 */
const publishEventRejected = async (event) => {
  await publishEvent(TOPICS.EVENT_REJECTED, event._id.toString(), {
    eventId: event._id.toString(),
    title: event.title,
    type: event.type,
    college: event.college,
    createdBy: event.createdBy.toString(),
    contact: event.contact
  });
};

module.exports = {
  publishEventCreated,
  publishEventUpdated,
  publishEventApproved,
  publishEventRejected
};
