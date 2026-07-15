/**
 * Kafka Consumer Factory
 *
 * Creates isolated consumer instances with:
 * - Per-message retry with exponential backoff
 * - Dead letter logging for permanently failed messages
 * - Graceful shutdown support
 * - Independent consumer groups for fan-out
 */

const { kafka } = require('./producer');

// Track all active consumers for graceful shutdown
const activeConsumers = [];

/**
 * Create and start a Kafka consumer.
 *
 * @param {string} groupId - Consumer group ID (use CONSUMER_GROUPS constants)
 * @param {Object.<string, Function>} topicHandlers - Map of topic name → async handler(parsedPayload)
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
    console.log(`[Kafka Consumer:${groupId}] Connected`);
  });

  consumer.on('consumer.disconnect', () => {
    console.warn(`[Kafka Consumer:${groupId}] Disconnected`);
  });

  consumer.on('consumer.crash', ({ payload }) => {
    console.error(`[Kafka Consumer:${groupId}] Crashed:`, payload.error?.message);
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
          console.warn(`[Kafka Consumer:${groupId}] No handler for topic: ${topic}`);
          return;
        }

        let payload;
        try {
          payload = JSON.parse(message.value.toString());
        } catch (parseErr) {
          console.error(`[Kafka Consumer:${groupId}] Malformed message on ${topic}:`, parseErr.message);
          logDeadLetter(groupId, topic, message, 'PARSE_ERROR', parseErr.message);
          return; // Skip unrecoverable malformed messages
        }

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
            return; // Success — exit retry loop
          } catch (handlerErr) {
            attempt++;
            if (attempt > maxRetries) {
              console.error(
                `[Kafka Consumer:${groupId}] Handler failed after ${maxRetries} retries on ${topic}:`,
                handlerErr.message
              );
              logDeadLetter(groupId, topic, message, 'HANDLER_FAILURE', handlerErr.message);
              return; // Exhausted retries — skip message
            }

            const delay = baseRetryMs * Math.pow(4, attempt - 1); // 100ms → 400ms → 1600ms
            console.warn(
              `[Kafka Consumer:${groupId}] Retry ${attempt}/${maxRetries} for ${topic} in ${delay}ms:`,
              handlerErr.message
            );
            await sleep(delay);
          }
        }
      }
    });

    activeConsumers.push(consumer);
    console.log(`[Kafka Consumer:${groupId}] Running — subscribed to: [${topics.join(', ')}]`);
    return consumer;
  } catch (err) {
    console.error(`[Kafka Consumer:${groupId}] Failed to start:`, err.message);
    return null;
  }
};

/**
 * Log a permanently failed message as a dead letter entry.
 * In a production environment, this could publish to a dedicated DLQ topic.
 */
function logDeadLetter(groupId, topic, message, reason, errorMessage) {
  const dlqEntry = {
    consumer: groupId,
    topic,
    partition: message.partition,
    offset: message.offset,
    key: message.key?.toString(),
    reason,
    error: errorMessage,
    timestamp: new Date().toISOString(),
    value: message.value?.toString().substring(0, 500) // Truncate for logging
  };
  console.error(`[Kafka DLQ] Dead letter:`, JSON.stringify(dlqEntry));
}

/**
 * Disconnect all active consumers gracefully.
 */
const disconnectAllConsumers = async () => {
  for (const consumer of activeConsumers) {
    try {
      await consumer.disconnect();
    } catch (err) {
      console.error('[Kafka Consumer] Error during disconnect:', err.message);
    }
  }
  activeConsumers.length = 0;
  console.log('[Kafka Consumer] All consumers disconnected');
};

/**
 * Simple sleep helper for retry delays.
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { createConsumer, disconnectAllConsumers };
