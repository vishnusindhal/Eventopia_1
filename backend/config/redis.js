const { createClient } = require('redis');

let redisClient = null;
let isConnected = false;

/**
 * Initialize Redis connection with singleton pattern.
 * Provides auto-reconnect, failure logging, and graceful fallbacks.
 */
const initRedis = async () => {
  const url = process.env.REDIS_URL || 'redis://localhost:6379';
  console.log(`[Redis] Connecting to Redis at ${url}...`);

  redisClient = createClient({
    url,
    socket: {
      reconnectStrategy: (retries) => {
        // Reconnect every 3 seconds up to 10 retries, then backoff to 10 seconds
        const delay = Math.min(retries * 100, 3000);
        console.warn(`[Redis] Connection lost. Reconnecting in ${delay}ms... (Attempt ${retries})`);
        return delay;
      }
    }
  });

  redisClient.on('error', (err) => {
    console.error('[Redis] Client error:', err.message);
    isConnected = false;
  });

  redisClient.on('connect', () => {
    console.log('[Redis] Connecting...');
  });

  redisClient.on('ready', () => {
    console.log('[Redis] Connection established and client is ready');
    isConnected = true;
  });

  redisClient.on('end', () => {
    console.warn('[Redis] Connection closed');
    isConnected = false;
  });

  try {
    await redisClient.connect();
  } catch (err) {
    console.error('[Redis] First connection attempt failed:', err.message);
    isConnected = false;
  }
};

const getClient = () => redisClient;
const getIsConnected = () => isConnected;

module.exports = {
  initRedis,
  getClient,
  getIsConnected
};
