import { getStore } from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';
import { nowISO, orderedPair } from '../utils/helpers.js';

/**
 * Finds the match between two users (in either order).
 * @param {number} a First user id.
 * @param {number} b Second user id.
 * @returns {Promise<object|null>} Match or null.
 */
export async function getMatchBetween(a, b) {
  const [userAId, userBId] = orderedPair(a, b);
  return getStore().matches.findOne({ userAId, userBId });
}

/**
 * Creates the match between two users if it does not exist yet.
 * @param {number} a First user id.
 * @param {number} b Second user id.
 * @returns {Promise<object>} Existing or new match.
 */
export async function ensureMatch(a, b) {
  const existing = await getMatchBetween(a, b);
  if (existing) return existing;
  const [userAId, userBId] = orderedPair(a, b);
  return getStore().matches.create({ userAId, userBId, createdAt: nowISO() });
}

/**
 * Lists all matches a user takes part in, newest first.
 * @param {number} userId User id.
 * @returns {Promise<object[]>} Matches.
 */
export async function listMatchesOf(userId) {
  const store = getStore();
  const [asA, asB] = await Promise.all([store.matches.find({ userAId: userId }), store.matches.find({ userBId: userId })]);
  return [...asA, ...asB].sort((x, y) => y.createdAt.localeCompare(x.createdAt) || y.id - x.id);
}

/**
 * Returns the id of the other participant of a match.
 * @param {object} match Match document.
 * @param {number} userId One participant.
 * @returns {number} The other participant's id.
 */
export const otherUserId = (match, userId) => (match.userAId === userId ? match.userBId : match.userAId);

/**
 * Loads a match and checks that the user is part of it.
 * @param {number} userId Participant id.
 * @param {number} matchId Match id.
 * @returns {Promise<object>} Match.
 * @throws {NotFoundError} When the match does not exist or the user is not part of it.
 */
export async function getMatchForUser(userId, matchId) {
  const match = await getStore().matches.findById(matchId);
  if (!match || (match.userAId !== userId && match.userBId !== userId)) throw new NotFoundError('Match not found');
  return match;
}
