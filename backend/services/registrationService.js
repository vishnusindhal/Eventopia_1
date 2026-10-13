const mongoose = require('mongoose');
const Event = require('../models/Event');
const User = require('../models/User');
const Registration = require('../models/Registration');

const createError = (statusCode, code, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
};

const isTransactionUnsupported = (error) => {
  const unsupportedCodes = [20, 251, 263, 8000];
  return unsupportedCodes.includes(error?.code) || /transaction numbers are only allowed|replica set|mongos/i.test(error?.message || '');
};

const hasLegacyRegistration = (event, userId) => event.registeredUsers.some(
  registeredUser => registeredUser.toString() === userId.toString()
);

const ensureEligible = (event) => {
  if (!event) {
    throw createError(404, 'EVENT_NOT_FOUND', 'Event not found');
  }

  if (event.status !== 'approved') {
    throw createError(409, 'EVENT_NOT_OPEN', 'This event is not open for registration');
  }

  if (event.registrationDeadline && new Date(event.registrationDeadline) <= new Date()) {
    throw createError(409, 'REGISTRATION_CLOSED', 'Registration for this event is closed');
  }
};

const ensureNotRegistered = async (event, userId, session) => {
  if (hasLegacyRegistration(event, userId)) {
    throw createError(409, 'ALREADY_REGISTERED', 'Already registered for this event');
  }

  const existing = await Registration.findOne({
    event: event._id,
    user: userId,
    status: 'confirmed'
  }).session(session || null);

  if (existing) {
    throw createError(409, 'ALREADY_REGISTERED', 'Already registered for this event');
  }
};

const claimSeat = async (eventId, session) => {
  const claimedEvent = await Event.findOneAndUpdate(
    {
      _id: eventId,
      status: 'approved',
      $or: [
        { capacity: null },
        { capacity: { $exists: false } },
        {
          $expr: {
            $lt: [
              { $ifNull: ['$registrationCount', 0] },
              '$capacity'
            ]
          }
        }
      ]
    },
    { $inc: { registrationCount: 1 } },
    { new: true, session }
  );

  if (!claimedEvent) {
    const currentEvent = await Event.findById(eventId).session(session || null);
    if (!currentEvent) {
      throw createError(404, 'EVENT_NOT_FOUND', 'Event not found');
    }

    if (currentEvent.capacity !== null && currentEvent.capacity !== undefined) {
      throw createError(409, 'EVENT_FULL', 'This event is full');
    }

    throw createError(409, 'EVENT_NOT_OPEN', 'This event is not open for registration');
  }

  return claimedEvent;
};

const getUser = async (userId, session) => {
  const user = await User.findById(userId).select('name email').session(session || null);
  if (!user) {
    throw createError(401, 'USER_NOT_FOUND', 'User not found');
  }
  return user;
};

const registerWithTransaction = async (eventId, userId, session) => {
  const event = await Event.findById(eventId).session(session);
  ensureEligible(event);
  await ensureNotRegistered(event, userId, session);

  const claimedEvent = await claimSeat(eventId, session);
  const user = await getUser(userId, session);

  const [registration] = await Registration.create([{ event: eventId, user: userId, status: 'confirmed' }], { session });
  await Event.updateOne({ _id: eventId }, { $addToSet: { registeredUsers: userId } }, { session });
  await User.updateOne({ _id: userId }, { $addToSet: { registeredEvents: eventId } }, { session });

  return { event: claimedEvent, user, registration };
};

const registerWithoutTransaction = async (eventId, userId) => {
  const event = await Event.findById(eventId);
  ensureEligible(event);
  await ensureNotRegistered(event, userId);

  const claimedEvent = await claimSeat(eventId);
  let registration;

  try {
    registration = await Registration.create({ event: eventId, user: userId, status: 'confirmed' });
    const user = await getUser(userId);
    await Event.updateOne({ _id: eventId }, { $addToSet: { registeredUsers: userId } });
    await User.updateOne({ _id: userId }, { $addToSet: { registeredEvents: eventId } });
    return { event: claimedEvent, user, registration };
  } catch (error) {
    if (registration) {
      await Registration.deleteOne({ _id: registration._id }).catch(() => {});
    }
    await Event.updateOne(
      { _id: eventId, registrationCount: { $gt: 0 } },
      { $inc: { registrationCount: -1 }, $pull: { registeredUsers: userId } }
    ).catch(() => {});

    if (error?.code === 11000) {
      throw createError(409, 'ALREADY_REGISTERED', 'Already registered for this event');
    }
    throw error;
  }
};

const register = async (eventId, userId) => {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await registerWithTransaction(eventId, userId, session);
    });
    return result;
  } catch (error) {
    if (!isTransactionUnsupported(error)) {
      throw error;
    }
    return registerWithoutTransaction(eventId, userId);
  } finally {
    await session.endSession();
  }
};

const unregister = async (eventId, userId) => {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      const event = await Event.findById(eventId).session(session);
      if (!event) throw createError(404, 'EVENT_NOT_FOUND', 'Event not found');

      const registration = await Registration.findOneAndDelete({
        event: eventId,
        user: userId,
        status: 'confirmed'
      }, { session });
      const legacyRegistration = hasLegacyRegistration(event, userId);

      if (!registration && !legacyRegistration) {
        throw createError(400, 'NOT_REGISTERED', 'Not registered for this event');
      }

      const user = await getUser(userId, session);
      await Event.updateOne(
        { _id: eventId, registrationCount: { $gt: 0 } },
        { $inc: { registrationCount: -1 }, $pull: { registeredUsers: userId } },
        { session }
      );
      await User.updateOne({ _id: userId }, { $pull: { registeredEvents: eventId } }, { session });
      result = { event, user };
    });
    return result;
  } catch (error) {
    if (!isTransactionUnsupported(error)) throw error;

    const event = await Event.findById(eventId);
    if (!event) throw createError(404, 'EVENT_NOT_FOUND', 'Event not found');
    const registration = await Registration.findOneAndDelete({ event: eventId, user: userId, status: 'confirmed' });
    const legacyRegistration = hasLegacyRegistration(event, userId);
    if (!registration && !legacyRegistration) {
      throw createError(400, 'NOT_REGISTERED', 'Not registered for this event');
    }
    const user = await getUser(userId);
    await Event.updateOne(
      { _id: eventId, registrationCount: { $gt: 0 } },
      { $inc: { registrationCount: -1 }, $pull: { registeredUsers: userId } }
    );
    await User.updateOne({ _id: userId }, { $pull: { registeredEvents: eventId } });
    return { event, user };
  } finally {
    await session.endSession();
  }
};

const synchronizeRegistrationCounts = async () => {
  return Event.updateMany(
    { $or: [{ registrationCount: { $exists: false } }, { registrationCount: null }] },
    [{ $set: { registrationCount: { $size: { $ifNull: ['$registeredUsers', []] } } } }]
  );
};

module.exports = {
  register,
  unregister,
  synchronizeRegistrationCounts,
  createError
};