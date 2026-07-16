/**
 * Kafka Structured Logger — Centralized Observability
 *
 * Provides structured JSON logging for all Kafka lifecycle events.
 * Every log entry includes: topic, eventType, eventId, timestamps,
 * processing duration, and status — enabling full event tracing.
 *
 * Log Levels:
 *   INFO  — Normal operations (publish, consume, connect)
 *   WARN  — Recoverable issues (retry, reconnect, skip)
 *   ERROR — Failures (handler crash, DLQ, connection loss)
 *
 * All output goes to stdout/stderr via console methods so it integrates
 * with Docker log drivers, PM2, and cloud logging pipelines.
 */

const LOG_LEVELS = Object.freeze({
  INFO:  'INFO',
  WARN:  'WARN',
  ERROR: 'ERROR'
});

/**
 * Core structured log emitter.
 * Outputs a single-line JSON object to console for machine-parseable logging.
 *
 * @param {string} level     - LOG_LEVELS value
 * @param {string} component - Source component (e.g. 'Producer', 'Consumer:email')
 * @param {string} action    - What happened (e.g. 'PUBLISHED', 'CONSUMED', 'RETRY')
 * @param {object} [data]    - Structured payload with event context
 */
function log(level, component, action, data = {}) {
  const entry = {
    level,
    component: `Kafka:${component}`,
    action,
    timestamp: new Date().toISOString(),
    ...data
  };

  const serialized = JSON.stringify(entry);

  switch (level) {
    case LOG_LEVELS.ERROR:
      console.error(serialized);
      break;
    case LOG_LEVELS.WARN:
      console.warn(serialized);
      break;
    default:
      console.log(serialized);
  }
}

// ── Convenience Methods ──────────────────────────────────────────

/**
 * Log a successful message publish from the producer.
 */
function logPublished({ topic, eventId, key, producerTimestamp }) {
  log(LOG_LEVELS.INFO, 'Producer', 'PUBLISHED', {
    topic,
    eventId: eventId || key,
    key,
    producerTimestamp
  });
}

/**
 * Log a publish failure from the producer.
 */
function logPublishFailed({ topic, eventId, key, error }) {
  log(LOG_LEVELS.ERROR, 'Producer', 'PUBLISH_FAILED', {
    topic,
    eventId: eventId || key,
    key,
    error
  });
}

/**
 * Log the start of consumer message processing.
 * Returns a `finish` function that logs the completed result with duration.
 *
 * Usage:
 *   const finish = kafkaLogger.logConsumeStart({ topic, eventId, ... });
 *   // ... process message ...
 *   finish({ status: 'SUCCESS', details: { ... } });
 *
 * @returns {function} finish(result) — call when processing completes
 */
function logConsumeStart({ consumer, topic, eventId, partition, offset, producerTimestamp }) {
  const consumerTimestamp = new Date().toISOString();
  const startMs = Date.now();

  return function finish({ status, error, details } = {}) {
    const durationMs = Date.now() - startMs;

    const data = {
      topic,
      eventId,
      partition,
      offset,
      producerTimestamp,
      consumerTimestamp,
      durationMs,
      status: status || 'SUCCESS'
    };

    if (error) data.error = error;
    if (details) data.details = details;

    const level = status === 'FAILED' || status === 'DLQ' ? LOG_LEVELS.ERROR
                : status === 'RETRY' ? LOG_LEVELS.WARN
                : LOG_LEVELS.INFO;

    log(level, `Consumer:${consumer}`, 'CONSUMED', data);
  };
}

/**
 * Log a consumer retry attempt.
 */
function logRetry({ consumer, topic, eventId, attempt, maxRetries, delayMs, error }) {
  log(LOG_LEVELS.WARN, `Consumer:${consumer}`, 'RETRY', {
    topic,
    eventId,
    attempt,
    maxRetries,
    delayMs,
    error
  });
}

/**
 * Log a dead letter (permanently failed message).
 */
function logDeadLetter({ consumer, topic, eventId, partition, offset, reason, error, valueSample }) {
  log(LOG_LEVELS.ERROR, `Consumer:${consumer}`, 'DEAD_LETTER', {
    topic,
    eventId,
    partition,
    offset,
    reason,
    error,
    valueSample
  });
}

/**
 * Log a connection lifecycle event (connect, disconnect, crash).
 */
function logConnection(component, action, data = {}) {
  const level = action === 'CRASHED' ? LOG_LEVELS.ERROR
              : action === 'DISCONNECTED' ? LOG_LEVELS.WARN
              : LOG_LEVELS.INFO;

  log(level, component, action, data);
}

/**
 * Log a general Kafka system event (init, shutdown, etc).
 */
function logSystem(action, data = {}) {
  log(LOG_LEVELS.INFO, 'System', action, data);
}

/**
 * Log a system-level warning.
 */
function logSystemWarn(action, data = {}) {
  log(LOG_LEVELS.WARN, 'System', action, data);
}

/**
 * Log a system-level error.
 */
function logSystemError(action, data = {}) {
  log(LOG_LEVELS.ERROR, 'System', action, data);
}

module.exports = {
  LOG_LEVELS,
  log,
  logPublished,
  logPublishFailed,
  logConsumeStart,
  logRetry,
  logDeadLetter,
  logConnection,
  logSystem,
  logSystemWarn,
  logSystemError
};
