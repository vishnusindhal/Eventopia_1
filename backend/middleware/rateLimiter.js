const { getClient, getIsConnected } = require('../config/redis');

/**
 * Redis-based API rate limiter middleware.
 * Implements a sliding window/fixed window limit per IP.
 * Fallback to default allowance if Redis goes down.
 *
 * @param {object} options – windowMs: window duration, max: max requests allowed
 */
const rateLimiter = (options = {}) => {
  const windowMs = options.windowMs || 60000; // default 1 minute window
  const max = options.max || 10; // default 10 requests
  const windowSeconds = Math.ceil(windowMs / 1000);

  return async (req, res, next) => {
    // If Redis is not connected, fallback gracefully (bypass rate limit)
    if (!getIsConnected()) {
      return next();
    }

    try {
      const client = getClient();
      const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      // Unique rate limiting key per IP and route path
      const key = `ratelimit:${ip}:${req.baseUrl}${req.path}`;

      const current = await client.incr(key);

      if (current === 1) {
        // Set expiry on first request in the window
        await client.expire(key, windowSeconds);
      }

      // Add headers
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, max - current));

      if (current > max) {
        console.warn(`[Rate Limiter] Limit exceeded for IP ${ip} on route ${req.baseUrl}${req.path} (${current}/${max})`);
        return res.status(429).json({
          success: false,
          message: 'Too many requests from this IP, please try again later.'
        });
      }

      next();
    } catch (err) {
      console.error('[Rate Limiter] Error executing Redis rate limit:', err.message);
      // Fallback gracefully on Redis rate limiter exception
      next();
    }
  };
};

module.exports = rateLimiter;
