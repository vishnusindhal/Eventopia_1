/**
 * Kafka Module — Central Orchestrator
 *
 * Initializes the Kafka producer and all consumer workers.
 * Provides a graceful shutdown function for clean teardown.
 *
 * Usage in server.js:
 *   const { initKafka, shutdownKafka } = require('./kafka');
 *   await initKafka();
 *   process.on('SIGTERM', shutdownKafka);
 */

const { initProducer, disconnectProducer } = require('./producer');
const { disconnectAllConsumers } = require('./consumer');
const { initEmailConsumer } = require('./consumers/emailConsumer');
const { initNotificationConsumer } = require('./consumers/notificationConsumer');
const { initAnalyticsConsumer } = require('./consumers/analyticsConsumer');

/**
 * Initialize the Kafka producer and all consumer workers.
 * Non-blocking — if Kafka is unavailable, the app continues running
 * and consumers/producers will retry automatically.
 */
const initKafka = async () => {
  console.log('[Kafka] Initializing Kafka module...');

  try {
    // Initialize producer first
    await initProducer();

    // Initialize consumers (each in its own consumer group)
    await Promise.allSettled([
      initEmailConsumer(),
      initNotificationConsumer(),
      initAnalyticsConsumer()
    ]);

    console.log('[Kafka] Module initialization complete');
  } catch (err) {
    console.error('[Kafka] Module initialization error:', err.message);
    console.warn('[Kafka] Application will continue without Kafka — background tasks disabled');
  }
};

/**
 * Gracefully shut down all Kafka connections.
 * Called on SIGTERM / SIGINT process signals.
 */
const shutdownKafka = async () => {
  console.log('[Kafka] Shutting down...');
  await disconnectAllConsumers();
  await disconnectProducer();
  console.log('[Kafka] Shutdown complete');
};

module.exports = { initKafka, shutdownKafka };
