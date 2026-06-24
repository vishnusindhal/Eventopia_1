const cron = require('node-cron');
const Event = require('../models/Event');
const User = require('../models/User');
const Notification = require('../models/Notification');
const emailService = require('./emailService');
const notificationService = require('./notificationService');

/**
 * Start all scheduled cron jobs.
 */
function startCronJobs() {
  // ── Daily Digest: every day at 8:00 PM (20:00) ────────────
  cron.schedule('0 20 * * *', async () => {
    console.log('[Cron] Running daily digest job...');
    await sendDailyDigest();
  }, { timezone: 'Asia/Kolkata' });

  // ── Deadline Reminders: every day at 9:00 AM ───────────────
  cron.schedule('0 9 * * *', async () => {
    console.log('[Cron] Running deadline reminder job...');
    await sendDeadlineReminders();
  }, { timezone: 'Asia/Kolkata' });

  // ── Registered Event Reminders: every hour ─────────────────
  cron.schedule('0 * * * *', async () => {
    await sendRegisteredEventReminders();
  }, { timezone: 'Asia/Kolkata' });

  console.log('[Cron] Scheduled jobs initialized (IST timezone)');
}

// ── Daily Digest ────────────────────────────────────────────
async function sendDailyDigest() {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Find events approved today
    const todaysEvents = await Event.find({
      status: 'approved',
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    if (todaysEvents.length === 0) {
      console.log('[Cron] No events approved today, skipping digest.');
      return;
    }

    // Group by category
    const eventsByCategory = {};
    todaysEvents.forEach(event => {
      const cat = event.type || 'Other';
      if (!eventsByCategory[cat]) eventsByCategory[cat] = [];
      eventsByCategory[cat].push(event);
    });

    // Find all users who opted into daily digest
    const users = await User.find({
      'notificationPreferences.dailyDigest': true,
      'notificationPreferences.emailEnabled': true
    }).select('email subscriptions');

    console.log(`[Cron] Sending daily digest to ${users.length} user(s) for ${todaysEvents.length} event(s)`);

    for (const user of users) {
      // Filter categories based on user subscriptions
      const userCategories = user.subscriptions?.categories || [];
      let filteredByCategory = {};

      if (userCategories.length === 0) {
        // No category filter — send everything
        filteredByCategory = eventsByCategory;
      } else {
        for (const cat of userCategories) {
          if (eventsByCategory[cat]) {
            filteredByCategory[cat] = eventsByCategory[cat];
          }
        }
      }

      if (Object.keys(filteredByCategory).length > 0) {
        await emailService.sendDailyDigest(user.email, filteredByCategory, new Date());
      }
    }
  } catch (err) {
    console.error('[Cron] Daily digest error:', err);
  }
}

// ── Deadline Reminders ──────────────────────────────────────
async function sendDeadlineReminders() {
  try {
    const now = new Date();
    const intervals = [
      { days: 7, label: '7 days' },
      { days: 3, label: '3 days' },
      { days: 1, label: '24 hours' }
    ];

    for (const { days, label } of intervals) {
      const targetStart = new Date(now);
      targetStart.setDate(targetStart.getDate() + days);
      targetStart.setHours(0, 0, 0, 0);

      const targetEnd = new Date(targetStart);
      targetEnd.setHours(23, 59, 59, 999);

      const events = await Event.find({
        status: 'approved',
        registrationDeadline: { $gte: targetStart, $lte: targetEnd }
      });

      for (const event of events) {
        // Notify all registered users for this event
        for (const userId of event.registeredUsers) {
          await notificationService.createNotification({
            userId,
            title: `⏰ Registration closes in ${label}`,
            message: `"${event.title}" registration deadline is in ${label}. Don't miss out!`,
            eventId: event._id,
            type: 'deadline_reminder',
            actionUrl: `/event/${event._id}`
          });
        }
      }
    }
  } catch (err) {
    console.error('[Cron] Deadline reminder error:', err);
  }
}

// ── Registered Event Start Reminders ────────────────────────
async function sendRegisteredEventReminders() {
  try {
    const now = new Date();

    // Events starting in the next hour
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    const events = await Event.find({
      status: 'approved',
      date: { $gte: now, $lte: oneHourLater },
      registeredUsers: { $exists: true, $not: { $size: 0 } }
    });

    for (const event of events) {
      for (const userId of event.registeredUsers) {
        // Prevent duplicate reminders: check if we already sent one for this event + type
        const exists = await Notification.findOne({
          userId,
          eventId: event._id,
          type: 'registration_reminder',
          createdAt: { $gte: new Date(now.getTime() - 2 * 60 * 60 * 1000) }
        });

        if (!exists) {
          await notificationService.createNotification({
            userId,
            title: '🔔 Event starting soon!',
            message: `"${event.title}" is starting within the next hour. Get ready!`,
            eventId: event._id,
            type: 'registration_reminder',
            actionUrl: `/event/${event._id}`
          });
        }
      }
    }
  } catch (err) {
    console.error('[Cron] Registered event reminder error:', err);
  }
}

module.exports = { startCronJobs };
