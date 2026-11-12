import { config } from '../config/constants.js';
import { getStore } from '../config/database.js';
import { getUserFromToken } from '../services/authService.js';
import { UnauthorizedError } from '../utils/errors.js';

/** Routes reachable without a token even when REQUIRE_AUTH=true. */
const PUBLIC_ROUTES = [
  { method: 'GET', path: '/' },
  { method: 'GET', path: '/health' },
  { method: 'GET', path: '/user/login' },
  { method: 'POST', path: '/user/login' },
  { method: 'GET', path: '/user/logout' },
  { method: 'POST', path: '/user' }
];

/**
 * Identifies the caller and sets `req.user` / `req.token`.
 *  - A valid "Authorization: Bearer <token>" always wins.
 *  - REQUIRE_AUTH=true: every non-public route needs a valid token (401 otherwise).
 *  - REQUIRE_AUTH=false (demo mode): without a token the caller is the user from
 *    the `X-User-Id` header, or DEFAULT_USER_ID, so the API is easy to try out.
 * @param {import('express').Request} req Express request.
 * @param {import('express').Response} _res Express response.
 * @param {import('express').NextFunction} next Next middleware.
 * @returns {Promise<void>}
 */
export async function authenticate(req, _res, next) {
  try {
    const header = req.get('authorization') ?? '';
    const token = /^Bearer\s+/i.test(header) ? header.replace(/^Bearer\s+/i, '').trim() : null;
    let user = token ? await getUserFromToken(token) : null;

    if (!user && !config.requireAuth) {
      const demoId = Number.parseInt(req.get('x-user-id') ?? '', 10) || config.defaultUserId;
      user = await getStore().users.findById(demoId);
    }

    if (!user && config.requireAuth) {
      const isPublic = PUBLIC_ROUTES.some((route) => route.method === req.method && route.path === req.path.replace(/(.)\/$/, '$1'));
      if (!isPublic) {
        throw new UnauthorizedError(token ? 'Invalid or expired token' : 'Authentication required', 'AUTH_REQUIRED');
      }
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Returns the authenticated caller or throws 401.
 * @param {import('express').Request} req Express request.
 * @returns {object} The raw user document of the caller.
 * @throws {UnauthorizedError} When nobody is authenticated.
 */
export function requireUser(req) {
  if (!req.user) throw new UnauthorizedError('Authentication required', 'AUTH_REQUIRED');
  return req.user;
}
