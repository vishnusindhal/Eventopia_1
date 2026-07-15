/**
 * Kafka Topic Name Constants
 *
 * Centralizes all topic names to prevent magic strings across
 * producers and consumers. Uses dot-notation naming convention
 * for scalability: <domain>.<action>
 */

const TOPICS = Object.freeze({
  // ── Event Lifecycle ──────────────────────────────────────────
  EVENT_CREATED:  'event.created',
  EVENT_UPDATED:  'event.updated',
  EVENT_APPROVED: 'event.approved',
  EVENT_REJECTED: 'event.rejected',

  // ── Registration Lifecycle ───────────────────────────────────
  REGISTRATION_CREATED:   'registration.created',
  REGISTRATION_CANCELLED: 'registration.cancelled',

  // ── Generic Messaging ────────────────────────────────────────
  NOTIFICATION_SEND: 'notification.send',
  EMAIL_SEND:        'email.send'
});

/**
 * Consumer Group IDs — each consumer type runs in its own group
 * so every message fans out to all consumer types independently.
 */
const CONSUMER_GROUPS = Object.freeze({
  EMAIL:        'eventopia-email-consumer',
  NOTIFICATION: 'eventopia-notification-consumer',
  ANALYTICS:    'eventopia-analytics-consumer'
});

module.exports = { TOPICS, CONSUMER_GROUPS };
