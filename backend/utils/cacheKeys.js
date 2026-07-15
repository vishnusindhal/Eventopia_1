/**
 * Cache key templates and generator utilities to maintain naming conventions.
 */
module.exports = {
  // Event Keys
  eventDetails: (id) => `events:id:${id}`,
  eventList: (queryString = '') => `events:list:${queryString}`,
  eventSearch: (query = '') => `events:search:${query.toLowerCase().trim()}`,
  
  // Categories Keys
  categoriesList: () => 'categories:list',
  categoriesCount: () => 'categories:count',

  // College & Institution Keys
  collegeEvents: (collegeName) => `college:events:${collegeName.toLowerCase().replace(/\s+/g, '-')}`,
  institutionEvents: (type) => `institution:${type.toLowerCase()}`,

  // Notifications
  unreadNotificationCount: (userId) => `notifications:unread:${userId}`,

  // User Stats
  userStats: (userId) => `user:stats:${userId}`,

  // Glob/Wildcard patterns for invalidation
  patterns: {
    allEventsList: 'events:list:*',
    allSearches: 'events:search:*',
    allColleges: 'college:events:*',
    allInstitutions: 'institution:*',
    allCategories: 'categories:*'
  }
};
