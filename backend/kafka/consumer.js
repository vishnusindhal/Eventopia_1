/**
 * Kafka Consumer Factory
 *
 * Creates isolated consumer instances with:
 * - Per-message retry with exponential backoff
 * - Dead letter logging for permanently failed messages
 * - Automatic structured observability via kafkaLogger
 * - Processing duration measurement per message
 * - Graceful shutdown support
 * - Independent consumer groups for fan-out
 */

const { kafka } = require('./producer');
const kafkaLogger = require('./kafkaLogger');

// Track all active consumers for graceful shutdown
const activeConsumers = [];

/**
 * Create and start a Kafka consumer.
 *
 * @param {string} groupId - Consumer group ID (use CONSUMER_GROUPS constants)
 * @param {Object.<string, Function>} topicHandlers - Map of topic name → async handler(parsedPayload, meta)
 * @param {object} [options]
 * @param {number} [options.maxRetries=3] - Max retry attempts per message
 * @param {number} [options.baseRetryMs=100] - Base retry delay in ms (exponential)
 * @returns {object} The KafkaJS consumer instance
 */
const createConsumer = async (groupId, topicHandlers, options = {}) => {
  const { maxRetries = 3, baseRetryMs = 100 } = options;
  const topics = Object.keys(topicHandlers);

  const consumer = kafka.consumer({
    groupId,
    sessionTimeout: 30000,
    heartbeatInterval: 3000,
    retry: {
      initialRetryTime: 1000,
      retries: 5
    }
  });

  consumer.on('consumer.connect', () => {
    kafkaLogger.logConnection(`Consumer:${groupId}`, 'CONNECTED');
  });

  consumer.on('consumer.disconnect', () => {
    kafkaLogger.logConnection(`Consumer:${groupId}`, 'DISCONNECTED');
  });

  consumer.on('consumer.crash', ({ payload }) => {
    kafkaLogger.logConnection(`Consumer:${groupId}`, 'CRASHED', {
      error: payload.error?.message
    });
  });

  try {
    await consumer.connect();

    // Subscribe to all topics for this consumer group
    for (const topic of topics) {
      await consumer.subscribe({ topic, fromBeginning: false });
    }

    // Start processing messages
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const handler = topicHandlers[topic];
        if (!handler) {
          kafkaLogger.logSystemWarn('NO_HANDLER', { consumer: groupId, topic });
          return;
        }

        // Parse message payload
        let payload;
        try {
          payload = JSON.parse(message.value.toString());
        } catch (parseErr) {
          kafkaLogger.logDeadLetter({
            consumer: groupId,
            topic,
            eventId: message.key?.toString(),
            partition,
            offset: message.offset,
            reason: 'PARSE_ERROR',
            error: parseErr.message,
            valueSample: message.value?.toString().substring(0, 200)
          });
          return; // Skip unrecoverable malformed messages
        }

        const eventId = payload.eventId || message.key?.toString();
        const producerTimestamp = payload.timestamp || null;

        // Start structured trace — returns a `finish()` callback
        const finish = kafkaLogger.logConsumeStart({
          consumer: groupId,
          topic,
          eventId,
          partition,
          offset: message.offset,
          producerTimestamp
        });

        // Retry loop with exponential backoff
        let attempt = 0;
        while (attempt <= maxRetries) {
          try {
            await handler(payload, {
              topic,
              partition,
              offset: message.offset,
              key: message.key?.toString(),
              timestamp: message.timestamp
            });

            // ✅ Success — log structured completion
            finish({ status: 'SUCCESS' });
            return;
          } catch (handlerErr) {
            attempt++;
            if (attempt > maxRetries) {
              // ❌ Exhausted retries — dead letter
              finish({ status: 'DLQ', error: handlerErr.message });

              kafkaLogger.logDeadLetter({
                consumer: groupId,
                topic,
                eventId,
                partition,
                offset: message.offset,
                reason: 'HANDLER_FAILURE',
                error: handlerErr.message,
                valueSample: message.value?.toString().substring(0, 200)
              });
              return;
            }

            // ⚠️ Retry
            const delay = baseRetryMs * Math.pow(4, attempt - 1); // 100ms → 400ms → 1600ms
            kafkaLogger.logRetry({
              consumer: groupId,
              topic,
              eventId,
              attempt,
              maxRetries,
              delayMs: delay,
              error: handlerErr.message
            });
            await sleep(delay);
          }
        }
      }
    });

    activeConsumers.push(consumer);
    kafkaLogger.logSystem('CONSUMER_RUNNING', {
      consumer: groupId,
      topics
    });
    return consumer;
  } catch (err) {
    kafkaLogger.logConnection(`Consumer:${groupId}`, 'START_FAILED', {
      error: err.message
    });
    return null;
  }
};

/**
 * Disconnect all active consumers gracefully.
 */
const disconnectAllConsumers = async () => {
  for (const consumer of activeConsumers) {
    try {
      await consumer.disconnect();
    } catch (err) {
      kafkaLogger.logConnection('Consumer', 'SHUTDOWN_ERROR', { error: err.message });
    }
  }
  activeConsumers.length = 0;
  kafkaLogger.logSystem('ALL_CONSUMERS_SHUTDOWN');
};

/**
 * Simple sleep helper for retry delays.
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { createConsumer, disconnectAllConsumers };
