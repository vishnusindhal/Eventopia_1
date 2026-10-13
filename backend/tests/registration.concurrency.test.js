const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const Event = require('../models/Event');
const User = require('../models/User');
const Registration = require('../models/Registration');
const registrationService = require('../services/registrationService');

const mongoUri = process.env.MONGO_TEST_URI;
const shouldRun = Boolean(mongoUri);
const createdEventIds = [];
const createdUserIds = [];

const createUser = async (suffix) => {
  const user = await User.create({
    name: `Capacity Test ${suffix}`,
    email: `capacity-${Date.now()}-${suffix}@example.com`,
    password: 'secret123',
    college: 'Test College'
  });
  createdUserIds.push(user._id);
  return user;
};

const createEvent = async (capacity) => {
  const owner = await createUser(`owner-${capacity}-${createdEventIds.length}`);
  const event = await Event.create({
    title: `Capacity Test ${Date.now()}`,
    description: 'Concurrency test event',
    type: 'Technical',
    college: 'Test College',
    institutionType: 'Other',
    date: new Date(Date.now() + 86400000),
    venue: 'Online',
    organizer: 'Test Organizer',
    contact: 'organizer@example.com',
    status: 'approved',
    capacity,
    createdBy: owner._id
  });
  createdEventIds.push(event._id);
  return event;
};

const expectCode = async (promise, code) => {
  await assert.rejects(promise, error => error.code === code);
};

test('capacity concurrency suite requires MONGO_TEST_URI', { skip: shouldRun }, () => {
  assert.ok(true, 'Set MONGO_TEST_URI to run the real MongoDB concurrency tests.');
});

test('two concurrent requests compete for the final seat', { skip: !shouldRun }, async () => {
  const event = await createEvent(1);
  const users = await Promise.all([createUser('final-a'), createUser('final-b')]);
  const results = await Promise.allSettled(users.map(user => registrationService.register(event._id, user._id)));
  const succeeded = results.filter(result => result.status === 'fulfilled');
  const rejected = results.filter(result => result.status === 'rejected');

  assert.equal(succeeded.length, 1);
  assert.equal(rejected.length, 1);
  assert.equal(rejected[0].reason.code, 'EVENT_FULL');

  const storedEvent = await Event.findById(event._id);
  assert.equal(storedEvent.registrationCount, 1);
  assert.equal(await Registration.countDocuments({ event: event._id, status: 'confirmed' }), 1);
});

test('many concurrent requests never exceed capacity', { skip: !shouldRun }, async () => {
  const capacity = 5;
  const event = await createEvent(capacity);
  const users = await Promise.all(Array.from({ length: 20 }, (_, index) => createUser(`many-${index}`)));
  const results = await Promise.allSettled(users.map(user => registrationService.register(event._id, user._id)));
  const succeeded = results.filter(result => result.status === 'fulfilled');
  const rejected = results.filter(result => result.status === 'rejected');

  assert.equal(succeeded.length, capacity);
  assert.equal(rejected.length, users.length - capacity);
  assert.ok(rejected.every(result => result.reason.code === 'EVENT_FULL'));

  const storedEvent = await Event.findById(event._id);
  const registrationCount = await Registration.countDocuments({ event: event._id, status: 'confirmed' });
  assert.equal(storedEvent.registrationCount, capacity);
  assert.equal(registrationCount, capacity);
  assert.equal(new Set(storedEvent.registeredUsers.map(id => id.toString())).size, capacity);
});

test('duplicate registration is rejected without incrementing twice', { skip: !shouldRun }, async () => {
  const event = await createEvent(10);
  const user = await createUser('duplicate');
  await registrationService.register(event._id, user._id);
  await expectCode(registrationService.register(event._id, user._id), 'ALREADY_REGISTERED');

  const storedEvent = await Event.findById(event._id);
  assert.equal(storedEvent.registrationCount, 1);
  assert.equal(await Registration.countDocuments({ event: event._id, user: user._id }), 1);
});

test.after(async () => {
  if (!shouldRun) return;
  await Registration.deleteMany({ event: { $in: createdEventIds } });
  await Event.deleteMany({ _id: { $in: createdEventIds } });
  await User.deleteMany({ _id: { $in: createdUserIds } });
  await mongoose.disconnect();
});

test.before(async () => {
  if (shouldRun) {
    await mongoose.connect(mongoUri);
  }
});
