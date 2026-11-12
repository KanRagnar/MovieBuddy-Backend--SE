import crypto from 'node:crypto';
import { config } from '../config/constants.js';
import { getStore } from '../config/database.js';
import { UnauthorizedError } from '../utils/errors.js';
import { verifyPassword } from '../utils/helpers.js';
import { serializeUser } from './userService.js';

/** Active sessions: token -> { userId, expiresAt }. Kept in memory (cleared on restart). */
const sessions = new Map();

/**
 * Checks the credentials and opens a session.
 * @param {string} username The user's `userId` (username).
 * @param {string} password Plain text password.
 * @returns {Promise<{token:string, tokenType:string, expiresAt:string, user:object}>} Session details.
 * @throws {UnauthorizedError} When the credentials are wrong.
 */
export async function login(username, password) {
  const user = await getStore().users.findOne({ userId: String(username) });
  // Same error for unknown user and wrong password, so usernames cannot be probed.
  if (!user || !verifyPassword(String(password), user.passwordHash)) {
    throw new UnauthorizedError('Invalid username or password', 'INVALID_CREDENTIALS');
  }
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + config.tokenTtlHours * 3600 * 1000;
  sessions.set(token, { userId: user.id, expiresAt });
  return { token, tokenType: 'Bearer', expiresAt: new Date(expiresAt).toISOString(), user: await serializeUser(user, user) };
}

/**
 * Closes a session.
 * @param {string|null} token Bearer token.
 * @returns {boolean} True when a session was closed.
 */
export function logout(token) {
  return token ? sessions.delete(token) : false;
}

/**
 * Returns the user that owns a valid token.
 * @param {string} token Bearer token.
 * @returns {Promise<object|null>} Raw user or null when the token is invalid/expired.
 */
export async function getUserFromToken(token) {
  const session = sessions.get(token);
  if (!session) return null;
  if (session.expiresAt < Date.now()) {
    sessions.delete(token);
    return null;
  }
  return getStore().users.findById(session.userId);
}

/**
 * Drops every session of a user (e.g. after the account was deleted).
 * @param {number} userId User id.
 * @returns {void}
 */
export function revokeSessionsOf(userId) {
  for (const [token, session] of sessions) {
    if (session.userId === userId) sessions.delete(token);
  }
}
