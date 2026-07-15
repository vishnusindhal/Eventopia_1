/**
 * Kafka Producer — Singleton
 *
 * Provides a centralized, reusable producer instance with:
 * - Lazy initialization with retry backoff
 * - Graceful fallback when Kafka is unavailable
 * - Fire-and-forget publishing (never blocks HTTP responses)
 * - Graceful shutdown support
 */

const { Kafka, logLevel } = require('kafkajs');

const brokers = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');
const clientId = process.env.KAFKA_CLIENT_ID || 'eventopia-backend';

const kafka = new Kafka({
  clientId,
  brokers,
  logLevel: logLevel.WARN,
  retry: {
    initialRetryTime: 1000,
    retries: 5
  }
});

let producer = null;
let isConnected = false;

/**
 * Initialize the Kafka producer with connection retry logic.
 * This is non-blocking — if Kafka isn't ready, the app continues
 * and the producer will attempt reconnection.
 */
const initProducer = async () => {
  producer = kafka.producer({
    allowAutoTopicCreation: true,
    transactionTimeout: 30000
  });

  producer.on('producer.connect', () => {
    console.log('[Kafka Producer] Connected');
    isConnected = true;
  });

  producer.on('producer.disconnect', () => {
    console.warn('[Kafka Producer] Disconnected');
    isConnected = false;
  });

  try {
    await producer.connect();
  } catch (err) {
    console.error('[Kafka Producer] Initial connection failed:', err.message);
    console.warn('[Kafka Producer] Will retry on next publish attempt');
    isConnected = false;
  }
};

/**
 * Publish a message to a Kafka topic.
 * Fire-and-forget: errors are caught and logged, never thrown.
 *
 * @param {string} topic - The topic name (use TOPICS constants)
 * @param {string} key   - Message key (used for partitioning, e.g. eventId)
 * @param {object} payload - The message payload (will be JSON-serialized)
 */
const publishEvent = async (topic, key, payload) => {
  if (!producer) {
    console.warn(`[Kafka Producer] Not initialized — skipping publish to ${topic}`);
    return;
  }

  try {
    // If disconnected, attempt a reconnect before publishing
    if (!isConnected) {
      console.log('[Kafka Producer] Attempting reconnect before publish...');
      await producer.connect();
    }

    await producer.send({
      topic,
      messages: [
        {
          key: String(key),
          value: JSON.stringify({
            ...payload,
            timestamp: new Date().toISOString()
          })
        }
      ]
    });

    console.log(`[Kafka Producer] Published to ${topic} (key: ${key})`);
  } catch (err) {
    console.error(`[Kafka Producer] Failed to publish to ${topic}:`, err.message);
    // Silently fail — API continues working without Kafka
  }
};

/**
 * Gracefully disconnect the producer.
 */
const disconnectProducer = async () => {
  if (producer) {
    try {
      await producer.disconnect();
      console.log('[Kafka Producer] Gracefully disconnected');
    } catch (err) {
      console.error('[Kafka Producer] Error during disconnect:', err.message);
    }
  }
};

/**
 * Check if the producer is currently connected.
 */
const getIsConnected = () => isConnected;

module.exports = {
  kafka,
  initProducer,
  publishEvent,
  disconnectProducer,
  getIsConnected
};
