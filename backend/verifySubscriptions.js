const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Event = require('./models/Event');
const Notification = require('./models/Notification');
const { notifyOnEventApproval, findMatchingSubscribers } = require('./services/notificationService');

dotenv.config();

async function runTest() {
  console.log('Connecting to database...');
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eventopia');
  console.log('Database connected.');

  // Clean up any existing test entities
  console.log('Cleaning up existing test entities...');
  await User.deleteMany({ email: /@test-subscription-matching\.com$/ });
  await Event.deleteMany({ title: /\[Test Matching\]/ });

  // Create 3 test users:
  // User 1: Subscribed to IIIT Surat (specific college) and Category "Hackathon"
  const user1 = await User.create({
    name: 'User One (Specific College)',
    email: 'user1@test-subscription-matching.com',
    password: 'password123',
    college: 'IIIT Surat',
    institutionType: 'IIIT',
    subscriptions: {
      institutes: ['IIIT Surat'],
      institutionTypes: [],
      categories: ['Hackathon'],
      subscribeAllInstitutes: false
    },
    notificationPreferences: {
      emailEnabled: false, // Turn off email to avoid nodemailer errors/logging
      inAppEnabled: true,
      instantAlerts: true
    }
  });

  // User 2: Subscribed to all IITs (institution type) and receives all categories (empty categories array)
  const user2 = await User.create({
    name: 'User Two (IIT Type)',
    email: 'user2@test-subscription-matching.com',
    password: 'password123',
    college: 'IIT Bombay',
    institutionType: 'IIT',
    subscriptions: {
      institutes: [],
      institutionTypes: ['IIT'],
      categories: [], // empty = all categories
      subscribeAllInstitutes: false
    },
    notificationPreferences: {
      emailEnabled: false,
      inAppEnabled: true,
      instantAlerts: true
    }
  });

  // User 3: Subscribed to All Institutes, but only "Workshop" category
  const user3 = await User.create({
    name: 'User Three (All Institutes, Workshop)',
    email: 'user3@test-subscription-matching.com',
    password: 'password123',
    college: 'NIT Trichy',
    institutionType: 'NIT',
    subscriptions: {
      institutes: [],
      institutionTypes: [],
      categories: ['Workshop'],
      subscribeAllInstitutes: true
    },
    notificationPreferences: {
      emailEnabled: false,
      inAppEnabled: true,
      instantAlerts: true
    }
  });

  console.log('Created test users:', [user1.name, user2.name, user3.name]);

  // Create mock events:
  // Event A: IIIT Surat Hackathon (Should match User 1 only, because category is Hackathon and institute is IIIT Surat. User 3 is Workshop only, User 2 is IIT only)
  const eventA = await Event.create({
    title: '[Test Matching] IIIT Surat Hackathon',
    description: 'This is a test hackathon event',
    college: 'IIIT Surat',
    institutionType: 'IIIT',
    type: 'Hackathon',
    date: new Date(),
    venue: 'Campus',
    organizedBy: 'Coding Club',
    organizer: 'Coding Club Organizer',
    contact: 'organizer@test-subscription-matching.com',
    registrationDeadline: new Date(Date.now() + 5*24*60*60*1000),
    status: 'approved',
    createdBy: user1._id
  });

  // Event B: IIT Delhi Seminar (Should match User 2 only, because institute type is IIT and User 2 has empty categories list (receive all). User 1 is IIIT Surat, User 3 is Workshop only)
  const eventB = await Event.create({
    title: '[Test Matching] IIT Delhi Seminar',
    description: 'This is a test seminar event',
    college: 'IIT Delhi',
    institutionType: 'IIT',
    type: 'Seminar',
    date: new Date(),
    venue: 'LHC',
    organizedBy: 'Physics Dept',
    organizer: 'Physics Organizer',
    contact: 'physics@test-subscription-matching.com',
    registrationDeadline: new Date(Date.now() + 2*24*60*60*1000),
    status: 'approved',
    createdBy: user1._id
  });

  // Event C: NIT Warangal Workshop (Should match User 3 only, because User 3 has subscribeAllInstitutes and category matches Workshop. User 1 is IIIT Surat, User 2 is IIT only)
  const eventC = await Event.create({
    title: '[Test Matching] NIT Warangal Workshop',
    description: 'This is a test workshop event',
    college: 'NIT Warangal',
    institutionType: 'NIT',
    type: 'Workshop',
    date: new Date(),
    venue: 'Auditorium',
    organizedBy: 'IEEE NITW',
    organizer: 'IEEE NITW Organizer',
    contact: 'ieee@test-subscription-matching.com',
    registrationDeadline: new Date(Date.now() + 1*24*60*60*1000),
    status: 'approved',
    createdBy: user1._id
  });

  console.log('Created test events:', [eventA.title, eventB.title, eventC.title]);

  // Test Event A matches
  console.log('\n--- Testing Event A Matching ---');
  const matchesA = await findMatchingSubscribers(eventA);
  console.log(`Matched subscribers for Event A: ${matchesA.map(u => u.name).join(', ')}`);
  if (matchesA.length === 1 && matchesA[0]._id.equals(user1._id)) {
    console.log('SUCCESS: Event A correctly matched only User 1.');
  } else {
    console.error('FAILURE: Event A matching logic is incorrect!');
  }

  // Test Event B matches
  console.log('\n--- Testing Event B Matching ---');
  const matchesB = await findMatchingSubscribers(eventB);
  console.log(`Matched subscribers for Event B: ${matchesB.map(u => u.name).join(', ')}`);
  if (matchesB.length === 1 && matchesB[0]._id.equals(user2._id)) {
    console.log('SUCCESS: Event B correctly matched only User 2.');
  } else {
    console.error('FAILURE: Event B matching logic is incorrect!');
  }

  // Test Event C matches
  console.log('\n--- Testing Event C Matching ---');
  const matchesC = await findMatchingSubscribers(eventC);
  console.log(`Matched subscribers for Event C: ${matchesC.map(u => u.name).join(', ')}`);
  if (matchesC.length === 1 && matchesC[0]._id.equals(user3._id)) {
    console.log('SUCCESS: Event C correctly matched only User 3.');
  } else {
    console.error('FAILURE: Event C matching logic is incorrect!');
  }

  // Test notification trigger delivery logic
  console.log('\n--- Testing Notification Delivery ---');
  await notifyOnEventApproval(eventA);

  const notificationsForUser1 = await Notification.find({ userId: user1._id });
  console.log(`Notifications created for User 1: ${notificationsForUser1.length}`);
  if (notificationsForUser1.length === 1 && notificationsForUser1[0].eventId.equals(eventA._id)) {
    console.log('SUCCESS: In-App Notification generated correctly in DB.');
  } else {
    console.error('FAILURE: In-App Notification was not correctly generated.');
  }

  // Clean up
  console.log('\nCleaning up database...');
  await User.deleteMany({ email: /@test-subscription-matching\.com$/ });
  await Event.deleteMany({ title: /\[Test Matching\]/ });
  await Notification.deleteMany({ userId: { $in: [user1._id, user2._id, user3._id] } });

  console.log('Finished. Closing DB connection.');
  await mongoose.connection.close();
}

runTest().catch(err => {
  console.error('Error during test execution:', err);
  mongoose.connection.close();
});
