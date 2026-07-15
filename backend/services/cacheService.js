const { getClient, getIsConnected } = require('../config/redis');
const cacheKeys = require('../utils/cacheKeys');

/**
 * Cache operations wrapper service with MongoDB fallback and failure safety.
 */

/**
 * Fetch parsed data from Redis. Returns null on miss or when Redis is down.
 */
const get = async (key) => {
  if (!getIsConnected()) return null;
  try {
    const data = await getClient().get(key);
    if (!data) return null;
    return JSON.parse(data);
  } catch (err) {
    console.error(`[Cache Service] Error getting key "${key}":`, err.message);
    return null;
  }
};

/**
 * Store data in Redis with TTL. Fails silently if Redis is down.
 */
const set = async (key, value, ttlSeconds = 300) => {
  if (!getIsConnected()) return false;
  try {
    const serialized = JSON.stringify(value);
    await getClient().set(key, serialized, {
      EX: ttlSeconds
    });
    return true;
  } catch (err) {
    console.error(`[Cache Service] Error setting key "${key}":`, err.message);
    return false;
  }
};

/**
 * Delete a single key from Redis.
 */
const del = async (key) => {
  if (!getIsConnected()) return false;
  try {
    await getClient().del(key);
    return true;
  } catch (err) {
    console.error(`[Cache Service] Error deleting key "${key}":`, err.message);
    return false;
  }
};

/**
 * Cleanly scan and delete all keys matching a wildcard pattern (e.g. events:list:*).
 * Uses scanIterator to avoid blocking the Redis server.
 */
const invalidatePattern = async (pattern) => {
  if (!getIsConnected()) return false;
  try {
    const client = getClient();
    let count = 0;
    // scanIterator is standard in redis client v4
    for await (const key of client.scanIterator({ MATCH: pattern, COUNT: 100 })) {
      await client.del(key);
      count++;
    }
    if (count > 0) {
      console.log(`[Cache Service] Invalidated ${count} key(s) matching pattern: ${pattern}`);
    }
    return true;
  } catch (err) {
    console.error(`[Cache Service] Error invalidating pattern "${pattern}":`, err.message);
    return false;
  }
};

/**
 * Invalidate all general lists, searches, and category totals.
 */
const invalidateAllLists = async () => {
  await Promise.all([
    invalidatePattern(cacheKeys.patterns.allEventsList),
    invalidatePattern(cacheKeys.patterns.allSearches),
    invalidatePattern(cacheKeys.patterns.allColleges),
    invalidatePattern(cacheKeys.patterns.allInstitutions),
    invalidatePattern(cacheKeys.patterns.allCategories)
  ]);
};

/**
 * Target invalidation when a specific event changes (created, updated, approved, deleted).
 */
const invalidateEventData = async (eventId, collegeName, institutionType, creatorId) => {
  try {
    const promises = [];

    // Delete single event cache if eventId exists
    if (eventId) {
      promises.push(del(cacheKeys.eventDetails(eventId)));
    }

    // Invalidate general list and search caches
    promises.push(invalidateAllLists());

    // Invalidate specific college cache
    if (collegeName) {
      promises.push(del(cacheKeys.collegeEvents(collegeName)));
    }

    // Invalidate specific institution type cache
    if (institutionType) {
      promises.push(del(cacheKeys.institutionEvents(institutionType)));
    }

    // Invalidate user statistics for the event creator
    if (creatorId) {
      promises.push(del(cacheKeys.userStats(creatorId)));
    }

    await Promise.all(promises);
    console.log(`[Cache Service] Selected cache invalidated for event: ${eventId || 'new_event'}`);
  } catch (err) {
    console.error('[Cache Service] Error during selective event invalidation:', err.message);
  }
};

/**
 * Invalidate cached unread notifications count for a user.
 */
const invalidateUnreadCount = async (userId) => {
  if (!userId) return;
  await del(cacheKeys.unreadNotificationCount(userId));
};

/**
 * Invalidate cached user statistics.
 */
const invalidateUserStats = async (userId) => {
  if (!userId) return;
  await del(cacheKeys.userStats(userId));
};

module.exports = {
  get,
  set,
  del,
  invalidatePattern,
  invalidateAllLists,
  invalidateEventData,
  invalidateUnreadCount,
  invalidateUserStats
};
