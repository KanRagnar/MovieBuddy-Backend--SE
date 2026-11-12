import {
  MAX_AGE,
  MIN_AGE,
  MIN_PASSWORD_LENGTH,
  REVIEW_MAX_COMMENT_LENGTH,
  REVIEW_MAX_RATE,
  REVIEW_MIN_RATE,
  SHOWN_FAVORITES_COUNT,
  SWIPE_DIRECTIONS,
  TEXT_MAX_LENGTH
} from '../config/constants.js';

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const isString = (v) => typeof v === 'string';
const isNonEmptyString = (v) => isString(v) && v.trim().length > 0;
const isPositiveInt = (v) => Number.isInteger(v) && v > 0;
const isDateString = (v) => isString(v) && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BODY_ERROR = 'Request body must be a JSON object';

/**
 * Checks an e-mail address format.
 * @param {*} email Value to check.
 * @returns {boolean} True when valid.
 */
export const isValidEmail = (email) => isString(email) && EMAIL_RE.test(email);

/**
 * Validates a user create/update body. Every validator in this file returns
 * a list of error messages (empty list = valid).
 * @param {object} body Request body.
 * @param {{partial?: boolean}} [options] `partial` = update (all fields optional).
 * @returns {string[]} Validation errors.
 */
export function validateUserPayload(body, { partial = false } = {}) {
  if (!isObject(body)) return [BODY_ERROR];
  const errors = [];

  if (!partial) {
    for (const field of ['userId', 'name', 'age']) {
      if (body[field] === undefined) errors.push(`${field} is required`);
    }
  }
  if (body.userId !== undefined && !(isString(body.userId) && /^[A-Za-z0-9_.-]{3,30}$/.test(body.userId))) {
    errors.push('userId must be 3-30 characters (letters, numbers, _ . -)');
  }
  if (body.name !== undefined && !(isNonEmptyString(body.name) && body.name.length <= 60)) {
    errors.push('name must be a non-empty string up to 60 characters');
  }
  if (body.age !== undefined && !(Number.isInteger(body.age) && body.age >= MIN_AGE && body.age <= MAX_AGE)) {
    errors.push(`age must be an integer between ${MIN_AGE} and ${MAX_AGE}`);
  }
  if (!partial) {
    if (body.email !== undefined && !isValidEmail(body.email)) errors.push('email is not valid');
    if (body.password !== undefined && !(isString(body.password) && body.password.length >= MIN_PASSWORD_LENGTH)) {
      errors.push(`password must be at least ${MIN_PASSWORD_LENGTH} characters`);
    }
  }
  if (body.favoriteMovies !== undefined && !Array.isArray(body.favoriteMovies)) {
    errors.push('favoriteMovies must be an array of titles or title ids');
  }
  for (const field of ['sex', 'madeIn', 'job', 'into', 'education']) {
    if (body[field] !== undefined && !isString(body[field])) errors.push(`${field} must be a string`);
  }
  if (body.images !== undefined && !(Array.isArray(body.images) && body.images.every(isString))) {
    errors.push('images must be an array of strings');
  }
  for (const field of ['visible', 'notificationsEnabled', 'gpsEnabled']) {
    if (body[field] !== undefined && typeof body[field] !== 'boolean') errors.push(`${field} must be a boolean`);
  }
  return errors;
}

/**
 * Validates a review body (rate 1-10, comment up to 80 chars).
 * @param {object} body Request body.
 * @param {{partial?: boolean}} [options] `partial` = update.
 * @returns {string[]} Validation errors.
 */
export function validateReviewPayload(body, { partial = false } = {}) {
  if (!isObject(body)) return [BODY_ERROR];
  const errors = [];
  if (!partial) {
    if (body.rate === undefined) errors.push('rate is required');
    if (body.comment === undefined) errors.push('comment is required');
  }
  if (
    body.rate !== undefined &&
    !(Number.isInteger(body.rate) && body.rate >= REVIEW_MIN_RATE && body.rate <= REVIEW_MAX_RATE)
  ) {
    errors.push(`rate must be an integer between ${REVIEW_MIN_RATE} and ${REVIEW_MAX_RATE}`);
  }
  if (body.comment !== undefined && !(isString(body.comment) && body.comment.length <= REVIEW_MAX_COMMENT_LENGTH)) {
    errors.push(`comment must be a string of at most ${REVIEW_MAX_COMMENT_LENGTH} characters`);
  }
  if (body.date !== undefined && !isDateString(body.date)) errors.push('date must be formatted as YYYY-MM-DD');
  return errors;
}

/**
 * Validates a chat message body (sender/receiver are resolved by the service).
 * @param {object} body Request body.
 * @returns {string[]} Validation errors.
 */
export function validateTextPayload(body) {
  if (!isObject(body)) return [BODY_ERROR];
  const errors = [];
  if (!isNonEmptyString(body.script)) errors.push('script is required and must be a non-empty string');
  else if (body.script.length > TEXT_MAX_LENGTH) errors.push(`script must be at most ${TEXT_MAX_LENGTH} characters`);
  if (body.date !== undefined && !isDateString(body.date)) errors.push('date must be formatted as YYYY-MM-DD');
  return errors;
}

/**
 * Validates a title body (used when new titles are added / synced from TMDB).
 * @param {object} body Request body.
 * @returns {string[]} Validation errors.
 */
export function validateTitlePayload(body) {
  if (!isObject(body)) return [BODY_ERROR];
  const errors = [];
  if (!isNonEmptyString(body.title)) errors.push('title is required');
  if (!isNonEmptyString(body.description)) errors.push('description is required');
  if (body.releaseDate !== undefined && !isDateString(body.releaseDate)) {
    errors.push('releaseDate must be formatted as YYYY-MM-DD');
  }
  for (const field of ['duration', 'numOfSeasons', 'numOfEpisodes']) {
    if (body[field] !== undefined && !isPositiveInt(body[field])) errors.push(`${field} must be a positive integer`);
  }
  if (body.genre !== undefined && !isNonEmptyString(body.genre)) errors.push('genre must be a non-empty string');
  if (body.poster !== undefined && !isString(body.poster)) errors.push('poster must be a string');
  return errors;
}

/**
 * Validates a password-change body.
 * @param {object} body Request body.
 * @returns {string[]} Validation errors.
 */
export function validatePasswordPayload(body) {
  if (!isObject(body)) return [BODY_ERROR];
  if (!(isString(body.password) && body.password.length >= MIN_PASSWORD_LENGTH)) {
    return [`password is required and must be at least ${MIN_PASSWORD_LENGTH} characters`];
  }
  return [];
}

/**
 * Validates an e-mail change body.
 * @param {object} body Request body.
 * @returns {string[]} Validation errors.
 */
export function validateEmailPayload(body) {
  if (!isObject(body)) return [BODY_ERROR];
  return isValidEmail(body.email) ? [] : ['email is required and must be a valid e-mail address'];
}

/**
 * Validates a GPS location body.
 * @param {object} body Request body.
 * @returns {string[]} Validation errors.
 */
export function validateLocationPayload(body) {
  if (!isObject(body)) return [BODY_ERROR];
  const errors = [];
  if (!(typeof body.lat === 'number' && body.lat >= -90 && body.lat <= 90)) errors.push('lat must be a number between -90 and 90');
  if (!(typeof body.lng === 'number' && body.lng >= -180 && body.lng <= 180)) errors.push('lng must be a number between -180 and 180');
  if (body.label !== undefined && !isString(body.label)) errors.push('label must be a string');
  return errors;
}

/**
 * Validates a swipe body.
 * @param {object} body Request body.
 * @returns {string[]} Validation errors.
 */
export function validateSwipePayload(body) {
  if (!isObject(body)) return [BODY_ERROR];
  const errors = [];
  if (!isPositiveInt(body.targetId)) errors.push('targetId must be a positive integer');
  if (!SWIPE_DIRECTIONS.includes(body.direction)) errors.push(`direction must be one of: ${SWIPE_DIRECTIONS.join(', ')}`);
  return errors;
}

/**
 * Validates the "choose which favorites are shown on my profile" body.
 * @param {object} body Request body.
 * @returns {string[]} Validation errors.
 */
export function validateShownFavoritesPayload(body) {
  if (!isObject(body)) return [BODY_ERROR];
  const ids = body.titleIds;
  if (!Array.isArray(ids) || ids.length !== SHOWN_FAVORITES_COUNT || !ids.every(isPositiveInt) || new Set(ids).size !== ids.length) {
    return [`titleIds must contain exactly ${SHOWN_FAVORITES_COUNT} different title ids`];
  }
  return [];
}
