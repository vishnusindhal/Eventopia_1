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
const emailService = require('../../services/emailService');
const { findMatchingSubscribers } = require('../../services/notificationService');
const Event = require('../../models/Event');
const User = require('../../models/User');

/**
 * Handle event.approved — Send emails to all matching subscribers.
 */
async function handleEventApproved(payload) {
  const { eventId } = payload;

  // Fetch the full event document for email template rendering
  const event = await Event.findById(eventId);
  if (!event) {
    console.warn(`[Email Consumer] Event not found: ${eventId}`);
    return;
  }

  // Find all subscribers whose preferences match this event
  const matchingUsers = await findMatchingSubscribers(event);

  if (matchingUsers.length === 0) {
    console.log(`[Email Consumer] No subscribers matched for "${event.title}"`);
    return;
  }

  console.log(`[Email Consumer] Sending emails to ${matchingUsers.length} subscriber(s) for "${event.title}"`);

  // Send emails concurrently (emailService handles individual failures internally)
  const results = await Promise.allSettled(
    matchingUsers
      .filter(user =>
        user.notificationPreferences?.emailEnabled !== false &&
        user.notificationPreferences?.instantAlerts !== false
      )
      .map(user => emailService.sendEventNotification(user.email, event))
  );

  const sent = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;
  console.log(`[Email Consumer] Event approval emails — sent: ${sent}, failed: ${failed}`);
}

/**
 * Handle event.rejected — Notify the event organizer via email.
 */
async function handleEventRejected(payload) {
  const { eventId, title, contact } = payload;

  if (!contact) {
    console.warn(`[Email Consumer] No contact email for rejected event: ${eventId}`);
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
  console.log(`[Email Consumer] Rejection email sent to organizer: ${contact}`);
}

/**
 * Handle registration.created — Send confirmation email to the student.
 */
async function handleRegistrationCreated(payload) {
  const { userId, eventTitle, eventDate, eventVenue, college } = payload;

  const user = await User.findById(userId).select('email name notificationPreferences');
  if (!user) {
    console.warn(`[Email Consumer] User not found for registration email: ${userId}`);
    return;
  }

  // Respect user email preferences
  if (user.notificationPreferences?.emailEnabled === false) {
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
  console.log(`[Email Consumer] Registration confirmation sent to: ${user.email}`);
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
