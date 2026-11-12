import crypto from 'node:crypto';
import { config } from '../config/constants.js';
import { ForbiddenError } from './errors.js';

/**
 * Wraps an async route handler so rejected promises reach the error middleware.
 * @param {Function} fn Async handler `(req, res, next) => Promise`.
 * @returns {Function} Express compatible handler.
 */
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/**
 * Today's date as `YYYY-MM-DD`.
 * @returns {string} ISO date.
 */
export const todayISO = () => new Date().toISOString().slice(0, 10);

/**
 * Current timestamp as ISO string.
 * @returns {string} ISO timestamp.
 */
export const nowISO = () => new Date().toISOString();

/**
 * Hashes a password with scrypt and a random salt.
 * @param {string} password Plain text password.
 * @returns {string} `salt:hash` (hex).
 */
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verifies a password against a stored `salt:hash` value (constant time).
 * @param {string} password Plain text password.
 * @param {string|null} stored Stored hash.
 * @returns {boolean} True when the password matches.
 */
export function verifyPassword(password, stored) {
  if (!stored || typeof password !== 'string') return false;
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const expected = Buffer.from(hash, 'hex');
  const candidate = crypto.scryptSync(password, salt, expected.length);
  return crypto.timingSafeEqual(candidate, expected);
}

/**
 * Great-circle distance between two coordinates.
 * @param {{lat:number,lng:number}} a First point.
 * @param {{lat:number,lng:number}} b Second point.
 * @returns {number} Distance in kilometres.
 */
export function haversineKm(a, b) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadiusKm * Math.asin(Math.sqrt(h));
}

/**
 * Returns the two ids ordered ascending, so a pair is always stored the same way.
 * @param {number} a First id.
 * @param {number} b Second id.
 * @returns {[number, number]} Ordered pair.
 */
export const orderedPair = (a, b) => (a < b ? [a, b] : [b, a]);

/**
 * Copies only the listed keys that are defined in `source`.
 * @param {object} source Source object.
 * @param {string[]} keys Allowed keys.
 * @returns {object} New object with the picked keys.
 */
export function pick(source, keys) {
  const result = {};
  for (const key of keys) {
    if (source[key] !== undefined) result[key] = source[key];
  }
  return result;
}

/**
 * Ensures the acting user owns a resource. Only enforced when REQUIRE_AUTH=true;
 * in demo mode everything is open so the API is easy to test by hand.
 * @param {{id:number}|null} actor Authenticated user.
 * @param {number} ownerId Id of the resource owner.
 * @param {string} [message] Error message.
 * @throws {ForbiddenError} When the actor is not the owner.
 */
export function assertOwner(actor, ownerId, message = 'You are not allowed to access this resource') {
  if (!config.requireAuth) return;
  if (!actor || actor.id !== ownerId) throw new ForbiddenError(message);
}

/**
 * Rounds a number to one decimal place.
 * @param {number} value Number to round.
 * @returns {number} Rounded number.
 */
export const round1 = (value) => Math.round(value * 10) / 10;
