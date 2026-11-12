// Load a local .env file if present (built into Node >= 20.12, no extra dependency).
try {
  process.loadEnvFile();
} catch {
  // No .env file: fall back to defaults / real environment variables.
}

/**
 * Converts an environment string to a boolean.
 * @param {string|undefined} value Raw environment value.
 * @param {boolean} fallback Value used when the variable is unset or empty.
 * @returns {boolean} Parsed boolean.
 */
const toBool = (value, fallback = false) =>
  value === undefined || value === '' ? fallback : ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());

/**
 * Converts an environment string to an integer.
 * @param {string|undefined} value Raw environment value.
 * @param {number} fallback Value used when parsing fails.
 * @returns {number} Parsed integer.
 */
const toInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

/** Runtime configuration derived from environment variables. */
export const config = Object.freeze({
  env: process.env.NODE_ENV ?? 'development',
  port: toInt(process.env.PORT, 3000),
  apiPrefix: (process.env.API_PREFIX ?? '').replace(/\/+$/, ''),
  mongoUri: process.env.MONGODB_URI?.trim() || null,
  requireAuth: toBool(process.env.REQUIRE_AUTH, false),
  defaultUserId: toInt(process.env.DEFAULT_USER_ID, 1),
  tokenTtlHours: toInt(process.env.TOKEN_TTL_HOURS, 24),
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
  defaultRadiusKm: toInt(process.env.SUGGESTION_RADIUS_KM, 50)
});

/** Business-rule constants taken from the user stories / requirements. */
export const REVIEW_MIN_RATE = 1;
export const REVIEW_MAX_RATE = 10; // S-3: "rate out of 10"
export const REVIEW_MAX_COMMENT_LENGTH = 80; // S-3: "maximum length of 80"
export const TEXT_MAX_LENGTH = 1000;
export const MIN_FAVORITES_TO_SHOW = 4; // S-8
export const SHOWN_FAVORITES_COUNT = 4; // S-8
export const MIN_AGE = 18;
export const MAX_AGE = 120;
export const MIN_PASSWORD_LENGTH = 6;

export const SWIPE_DIRECTIONS = Object.freeze(['left', 'right']);

export const NOTIFICATION_TYPES = Object.freeze({
  NEW_TITLE: 'new_title',
  NEW_MATCH: 'new_match',
  NEW_MESSAGE: 'new_message'
});

export const MESSAGES = Object.freeze({
  NOTHING_MATCHES: 'Sorry! Nothing matches',
  PROFILE_CHANGED: 'Profile changed successfully',
  ALREADY_FAVORITE: 'This title is already in your favorite list',
  GPS_REQUIRED: 'GPS is mandatory to use the swiping feature. Please grant location permission.'
});
