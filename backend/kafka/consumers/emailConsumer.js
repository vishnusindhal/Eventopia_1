/**
 * Email Consumer — Handles email delivery for event and registration flows
 *
 * Consumer Group: eventopia-email-consumer
 * Subscriptions: event.approved, event.rejected, registration.created
 *
 * Responsibilities:
 * - Send notification emails to subscribers when events are approved
 * - Send rejection emails to organizers when events are rejected
 * - Send confirmation emails to students when they register
 */

const { createConsumer } = require('../consumer');
const { TOPICS, CONSUMER_GROUPS } = require('../topics');
const kafkaLogger = require('../kafkaLogger');
const emailService = require('../../services/emailService');
const { findMatchingSubscribers } = require('../../services/notificationService');
const Event = require('../../models/Event');
const User = require('../../models/User');

const CONSUMER_NAME = 'email';

/**
 * Handle event.approved — Send emails to all matching subscribers.
 */
async function handleEventApproved(payload) {
  const { eventId } = payload;

  // Fetch the full event document for email template rendering
  const event = await Event.findById(eventId);
  if (!event) {
    kafkaLogger.log(kafkaLogger.LOG_LEVELS.WARN, `Consumer:${CONSUMER_NAME}`, 'EVENT_NOT_FOUND', { eventId });
    return;
  }

  // Find all subscribers whose preferences match this event
  const matchingUsers = await findMatchingSubscribers(event);

  if (matchingUsers.length === 0) {
    kafkaLogger.log(kafkaLogger.LOG_LEVELS.INFO, `Consumer:${CONSUMER_NAME}`, 'NO_SUBSCRIBERS', {
      eventId, eventTitle: event.title
    });
    return;
  }

  // Send emails concurrently (emailService handles individual failures internally)
  const eligibleUsers = matchingUsers.filter(user =>
    user.notificationPreferences?.emailEnabled !== false &&
    user.notificationPreferences?.instantAlerts !== false
  );

  const results = await Promise.allSettled(
    eligibleUsers.map(user => emailService.sendEventNotification(user.email, event))
  );

  const sent = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;

  kafkaLogger.log(kafkaLogger.LOG_LEVELS.INFO, `Consumer:${CONSUMER_NAME}`, 'APPROVAL_EMAILS_SENT', {
    eventId,
    eventTitle: event.title,
    subscribersMatched: matchingUsers.length,
    eligible: eligibleUsers.length,
    sent,
    failed
  });
}

/**
 * Handle event.rejected — Notify the event organizer via email.
 */
async function handleEventRejected(payload) {
  const { eventId, title, contact } = payload;

  if (!contact) {
    kafkaLogger.log(kafkaLogger.LOG_LEVELS.WARN, `Consumer:${CONSUMER_NAME}`, 'NO_CONTACT_EMAIL', {
      eventId, eventTitle: title
    });
    return;
  }

  // Use the generic sendMail for rejection notice
  const subject = `❌ Event Rejected — "${title}" on Eventopia`;
  const html = `
    <h2>Event Rejected</h2>
    <p>Your event <strong>"${title}"</strong> has been reviewed and was not approved.</p>
    <p>Please review the event details and resubmit if applicable.</p>
    <p>If you believe this is an error, please contact the Eventopia admin team.</p>
  `;

  await emailService.sendMail(contact, subject, html);

  kafkaLogger.log(kafkaLogger.LOG_LEVELS.INFO, `Consumer:${CONSUMER_NAME}`, 'REJECTION_EMAIL_SENT', {
    eventId, recipient: contact
  });
}

/**
 * Handle registration.created — Send confirmation email to the student.
 */
async function handleRegistrationCreated(payload) {
  const { userId, eventId, eventTitle, eventDate, eventVenue, college } = payload;

  const user = await User.findById(userId).select('email name notificationPreferences');
  if (!user) {
    kafkaLogger.log(kafkaLogger.LOG_LEVELS.WARN, `Consumer:${CONSUMER_NAME}`, 'USER_NOT_FOUND', {
      userId, eventId
    });
    return;
  }

  // Respect user email preferences
  if (user.notificationPreferences?.emailEnabled === false) {
    kafkaLogger.log(kafkaLogger.LOG_LEVELS.INFO, `Consumer:${CONSUMER_NAME}`, 'EMAIL_DISABLED_BY_USER', {
      userId, eventId
    });
    return;
  }

  const formattedDate = eventDate
    ? new Date(eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'TBA';

  const subject = `✅ Registration Confirmed — "${eventTitle}" on Eventopia`;
  const html = `
    <h2>Registration Confirmed! 🎉</h2>
    <p>Hi ${user.name},</p>
    <p>You have successfully registered for:</p>
    <ul>
      <li><strong>Event:</strong> ${eventTitle}</li>
      <li><strong>Date:</strong> ${formattedDate}</li>
      <li><strong>Venue:</strong> ${eventVenue}</li>
      <li><strong>College:</strong> ${college}</li>
    </ul>
    <p>We'll send you reminders before the event starts. Good luck!</p>
  `;

  await emailService.sendMail(user.email, subject, html);

  kafkaLogger.log(kafkaLogger.LOG_LEVELS.INFO, `Consumer:${CONSUMER_NAME}`, 'REGISTRATION_EMAIL_SENT', {
    eventId, recipient: user.email
  });
}

/**
 * Initialize the email consumer.
 */
const initEmailConsumer = async () => {
  return createConsumer(CONSUMER_GROUPS.EMAIL, {
    [TOPICS.EVENT_APPROVED]: handleEventApproved,
    [TOPICS.EVENT_REJECTED]: handleEventRejected,
    [TOPICS.REGISTRATION_CREATED]: handleRegistrationCreated
  });
};

module.exports = { initEmailConsumer };
