const cacheService = require('../services/cacheService');
const cacheKeys = require('../utils/cacheKeys');

/**
 * Cache middleware to intercepts GET requests and serve from Redis if available.
 * Intercepts res.json to capture database responses and save them in Redis.
 */
const cacheMiddleware = (options = {}) => {
  return async (req, res, next) => {
    // Only cache GET operations
    if (req.method !== 'GET') {
      return next();
    }

    let cacheKey = null;
    let ttlSeconds = 300; // default 5 minutes

    const path = req.baseUrl + req.path;
    const query = req.query;

    // ── Determine Cache Key & TTL based on Route ─────────────────────
    if (path.startsWith('/api/events')) {
      // 1. Single Event Detail: /api/events/:id
      const idMatch = req.path.match(/^\/([a-f\d]{24})$/i);
      if (idMatch) {
        const eventId = idMatch[1];
        cacheKey = cacheKeys.eventDetails(eventId);
        ttlSeconds = 900; // 15 minutes (Medium)
      }
      // 2. Events by College: /api/events/college/:collegeName
      else if (req.path.startsWith('/college/')) {
        const collegeName = req.path.split('/')[2];
        if (collegeName) {
          cacheKey = cacheKeys.collegeEvents(collegeName);
          ttlSeconds = 900; // 15 minutes (Medium)
        }
      }
      // 3. Events by Institution: /api/events/institution/:institutionType
      else if (req.path.startsWith('/institution/')) {
        const instType = req.path.split('/')[2];
        if (instType) {
          cacheKey = cacheKeys.institutionEvents(instType);
          ttlSeconds = 900; // 15 minutes (Medium)
        }
      }
      // 4. Search query or general list
      else if (req.path === '/' || req.path === '') {
        if (query.search) {
          cacheKey = cacheKeys.eventSearch(query.search);
          ttlSeconds = 900; // 15 minutes (Medium)
        } else {
          // Serialize query parameters to create distinct keys
          const queryStr = Object.keys(query).sort().map(k => `${k}=${query[k]}`).join('&');
          cacheKey = cacheKeys.eventList(queryStr);
          ttlSeconds = 300; // 5 minutes (Short)
        }
      }
    } 
    // 5. User statistics page: /api/users/stats
    else if (path.startsWith('/api/users/stats') && req.user) {
      cacheKey = cacheKeys.userStats(req.user.id);
      ttlSeconds = 600; // 10 minutes (Medium)
    }
    // 6. Unread notification count: /api/notifications/unread-count
    else if (path.startsWith('/api/notifications/unread-count') && req.user) {
      cacheKey = cacheKeys.unreadNotificationCount(req.user.id);
      ttlSeconds = 60; // 1 minute (Short)
    }

    // ── Bypass cache if no key could be resolved ───────────────────
    if (!cacheKey) {
      return next();
    }

    // ── Attempt Cache Lookup ─────────────────────────────────────────
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) {
      res.setHeader('X-Cache-Status', 'HIT');
      return res.status(200).json(cachedData);
    }

    // ── Cache Miss: Capture Response JSON ────────────────────────────
    res.setHeader('X-Cache-Status', 'MISS');
    
    // Backup original res.json function
    const originalJson = res.json;

    res.json = function (body) {
      // Re-bind originalJson
      res.json = originalJson;

      // Only cache successful JSON responses with data
      if (res.statusCode >= 200 && res.statusCode < 300 && body && body.success !== false) {
        // Do not cache empty query lists or empty event responses
        const isEmptyEventsList = Array.isArray(body.events) && body.events.length === 0;
        const isEmptySearch = cacheKey.startsWith('events:search:') && isEmptyEventsList;
        
        if (!isEmptySearch) {
          cacheService.set(cacheKey, body, ttlSeconds).catch(err => {
            console.error(`[Cache Middleware] Async set failed for key ${cacheKey}:`, err.message);
          });
        }
      }

      return res.json(body);
    };

    next();
  };
};

module.exports = cacheMiddleware;
