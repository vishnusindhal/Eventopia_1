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
const kafkaLogger = require('./kafkaLogger');

/**
 * Initialize the Kafka producer and all consumer workers.
 * Non-blocking — if Kafka is unavailable, the app continues running
 * and consumers/producers will retry automatically.
 */
const initKafka = async () => {
  kafkaLogger.logSystem('INITIALIZING');

  try {
    // Initialize producer first
    await initProducer();

    // Initialize consumers (each in its own consumer group)
    await Promise.allSettled([
      initEmailConsumer(),
      initNotificationConsumer(),
      initAnalyticsConsumer()
    ]);

    kafkaLogger.logSystem('INITIALIZATION_COMPLETE');
  } catch (err) {
    kafkaLogger.logSystemError('INITIALIZATION_ERROR', { error: err.message });
    kafkaLogger.logSystemWarn('FALLBACK_MODE', { message: 'Application will continue without Kafka — background tasks disabled' });
  }
};

/**
 * Gracefully shut down all Kafka connections.
 * Called on SIGTERM / SIGINT process signals.
 */
const shutdownKafka = async () => {
  kafkaLogger.logSystem('SHUTDOWN_START');
  await disconnectAllConsumers();
  await disconnectProducer();
  kafkaLogger.logSystem('SHUTDOWN_COMPLETE');
};

module.exports = { initKafka, shutdownKafka };
