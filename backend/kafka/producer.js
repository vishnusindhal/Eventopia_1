/**
 * Kafka Producer — Singleton
 *
 * Provides a centralized, reusable producer instance with:
 * - Lazy initialization with retry backoff
 * - Graceful fallback when Kafka is unavailable
 * - Fire-and-forget publishing (never blocks HTTP responses)
 * - Structured observability logging via kafkaLogger
 * - Graceful shutdown support
 */

const { Kafka, logLevel } = require('kafkajs');
const kafkaLogger = require('./kafkaLogger');

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
    kafkaLogger.logConnection('Producer', 'CONNECTED');
    isConnected = true;
  });

  producer.on('producer.disconnect', () => {
    kafkaLogger.logConnection('Producer', 'DISCONNECTED');
    isConnected = false;
  });

  try {
    await producer.connect();
  } catch (err) {
    kafkaLogger.logConnection('Producer', 'CONNECTION_FAILED', { error: err.message });
    kafkaLogger.logSystemWarn('PRODUCER_FALLBACK', { message: 'Will retry on next publish attempt' });
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
    kafkaLogger.logPublishFailed({ topic, key, error: 'Producer not initialized' });
    return;
  }

  const producerTimestamp = new Date().toISOString();

  try {
    // If disconnected, attempt a reconnect before publishing
    if (!isConnected) {
      kafkaLogger.logConnection('Producer', 'RECONNECTING', { topic });
      await producer.connect();
    }

    await producer.send({
      topic,
      messages: [
        {
          key: String(key),
          value: JSON.stringify({
            ...payload,
            timestamp: producerTimestamp
          })
        }
      ]
    });

    kafkaLogger.logPublished({
      topic,
      eventId: payload.eventId || key,
      key: String(key),
      producerTimestamp
    });
  } catch (err) {
    kafkaLogger.logPublishFailed({
      topic,
      eventId: payload.eventId || key,
      key: String(key),
      error: err.message
    });
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
      kafkaLogger.logConnection('Producer', 'SHUTDOWN');
    } catch (err) {
      kafkaLogger.logConnection('Producer', 'SHUTDOWN_ERROR', { error: err.message });
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
