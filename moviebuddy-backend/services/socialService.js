import { config, MESSAGES, NOTIFICATION_TYPES } from '../config/constants.js';
import { getStore } from '../config/database.js';
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from '../utils/errors.js';
import { haversineKm, nowISO, round1 } from '../utils/helpers.js';
import { ensureMatch, getMatchForUser, listMatchesOf, otherUserId } from './matchService.js';
import { createNotification } from './notificationService.js';
import { getUserOrThrow, serializePublicProfiles } from './userService.js';

/**
 * Swiping needs the user's location (S-5: GPS is mandatory for swiping).
 * @param {object} user Raw user.
 * @throws {ForbiddenError} When GPS is not granted.
 */
function assertGps(user) {
  if (!user.gpsEnabled || !user.location) throw new ForbiddenError(MESSAGES.GPS_REQUIRED, 'GPS_REQUIRED');
}

/**
 * Returns ONE profile to swipe on (R-7): the nearest visible user the caller
 * has not swiped on yet and is not matched with.
 * @param {number} userId Caller id.
 * @param {{radiusKm?: number}} [options] Search radius (defaults to SUGGESTION_RADIUS_KM).
 * @returns {Promise<object|null>} Public profile with `distanceKm`, or null when nobody is left.
 */
export async function getNextProfile(userId, { radiusKm = config.defaultRadiusKm } = {}) {
  const store = getStore();
  const me = await getUserOrThrow(userId);
  assertGps(me);

  const [users, mySwipes, matches] = await Promise.all([store.users.find(), store.swipes.find({ fromUserId: userId }), listMatchesOf(userId)]);
  const excluded = new Set([userId, ...mySwipes.map((s) => s.toUserId), ...matches.map((m) => otherUserId(m, userId))]);

  const [nearest] = users
    .filter((u) => !excluded.has(u.id) && u.visible && u.gpsEnabled && u.location)
    .map((u) => ({ user: u, distance: haversineKm(me.location, u.location) }))
    .filter(({ distance }) => distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);

  if (!nearest) return null;
  const [profile] = await serializePublicProfiles([nearest.user]);
  return { ...profile, distanceKm: round1(nearest.distance) };
}

/**
 * Builds the API view of a match from the caller's point of view.
 * @param {object} match Match document.
 * @param {number} userId Caller id.
 * @returns {Promise<object>} Match with the other profile and the last message.
 */
async function describeMatch(match, userId) {
  const store = getStore();
  const otherId = otherUserId(match, userId);
  const other = await store.users.findById(otherId);
  const [profile] = other ? await serializePublicProfiles([other]) : [null];
  const [sent, received] = await Promise.all([
    store.texts.find({ senderId: userId, receiverId: otherId }),
    store.texts.find({ senderId: otherId, receiverId: userId })
  ]);
  const [lastText = null] = [...sent, ...received].sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id - a.id);
  return { matchId: match.id, matchedAt: match.createdAt, profile, lastText };
}

/**
 * Records a swipe. A right swipe on someone who already swiped right on the
 * caller creates a match and notifies both users.
 * @param {number} userId Caller id.
 * @param {{targetId:number, direction:'left'|'right'}} data Validated body.
 * @returns {Promise<{swipe:object, matched:boolean, match:object|null, nextProfile:object|null}>} Result.
 */
export async function swipe(userId, { targetId, direction }) {
  const store = getStore();
  const me = await getUserOrThrow(userId);
  assertGps(me);
  if (targetId === userId) throw new BadRequestError('You cannot swipe on your own profile');

  const target = await store.users.findById(targetId);
  if (!target || !target.visible) throw new NotFoundError('Profile not found');
  if (await store.swipes.findOne({ fromUserId: userId, toUserId: targetId })) {
    throw new ConflictError('You have already swiped on this profile', 'ALREADY_SWIPED');
  }

  const record = await store.swipes.create({ fromUserId: userId, toUserId: targetId, direction, createdAt: nowISO() });

  let match = null;
  if (direction === 'right' && (await store.swipes.findOne({ fromUserId: targetId, toUserId: userId, direction: 'right' }))) {
    match = await ensureMatch(userId, targetId);
    await createNotification(userId, NOTIFICATION_TYPES.NEW_MATCH, `You matched with ${target.name}!`, {
      matchId: match.id,
      profileId: target.id,
      name: target.name,
      location: target.location?.label ?? null
    });
    await createNotification(targetId, NOTIFICATION_TYPES.NEW_MATCH, `You matched with ${me.name}!`, {
      matchId: match.id,
      profileId: me.id,
      name: me.name,
      location: me.location?.label ?? null
    });
  }

  return {
    swipe: record,
    matched: Boolean(match),
    match: match ? await describeMatch(match, userId) : null,
    nextProfile: await getNextProfile(userId)
  };
}

/**
 * Lists the caller's matches (with the matched profile and last message).
 * @param {number} userId Caller id.
 * @returns {Promise<object[]>} Matches.
 */
export async function listMatches(userId) {
  await getUserOrThrow(userId);
  const matches = await listMatchesOf(userId);
  return Promise.all(matches.map((match) => describeMatch(match, userId)));
}

/**
 * Unmatches: removes the match and deletes the chat. Swipes are kept so the
 * profile does not come back in the suggestions.
 * @param {number} userId Caller id.
 * @param {number} matchId Match id.
 * @returns {Promise<{deletedTexts:number}>} Result.
 */
export async function unmatch(userId, matchId) {
  const store = getStore();
  const match = await getMatchForUser(userId, matchId);
  const other = otherUserId(match, userId);
  const deletedTexts =
    (await store.texts.removeWhere({ senderId: userId, receiverId: other })) +
    (await store.texts.removeWhere({ senderId: other, receiverId: userId }));
  await store.matches.remove(matchId);
  return { deletedTexts };
}
