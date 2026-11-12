import * as notificationService from '../services/notificationService.js';
import * as socialService from '../services/socialService.js';
import * as textService from '../services/textService.js';
import { BadRequestError } from '../utils/errors.js';
import { asyncHandler, assertOwner } from '../utils/helpers.js';
import { sendSuccess } from '../utils/responses.js';

/**
 * Checks the `:userId` of the path belongs to the caller (when auth is enforced).
 * @param {import('express').Request} req Express request.
 * @returns {number} The user id from the path.
 */
function ownUserId(req) {
  const id = Number(req.params.userId);
  assertOwner(req.user, id);
  return id;
}

/** GET /user/:userId/suggestions[?radiusKm=] - exactly one profile to swipe on. */
export const getSuggestion = asyncHandler(async (req, res) => {
  const id = ownUserId(req);
  const options = {};
  if (req.query.radiusKm !== undefined) {
    const radiusKm = Number(req.query.radiusKm);
    if (!(radiusKm > 0)) throw new BadRequestError('radiusKm must be a positive number');
    options.radiusKm = radiusKm;
  }
  const profile = await socialService.getNextProfile(id, options);
  sendSuccess(res, profile, profile ? 'Profile retrieved successfully' : 'No more profiles nearby, try again later');
});

/** POST /user/:userId/swipe - body `{ targetId, direction: 'left' | 'right' }`. */
export const swipe = asyncHandler(async (req, res) => {
  const result = await socialService.swipe(ownUserId(req), req.body);
  sendSuccess(res, result, result.matched ? "It's a match!" : 'Swipe recorded', 201);
});

/** GET /user/:userId/matches */
export const listMatches = asyncHandler(async (req, res) => {
  sendSuccess(res, await socialService.listMatches(ownUserId(req)), 'Matches retrieved successfully');
});

/** GET /user/:userId/matches/:matchId/texts - the chat of a match. */
export const getMatchTexts = asyncHandler(async (req, res) => {
  const texts = await textService.getMatchConversation(ownUserId(req), Number(req.params.matchId));
  sendSuccess(res, texts, 'Texts retrieved successfully');
});

/** DELETE /user/:userId/matches/:matchId - unmatch and delete the chat. */
export const unmatch = asyncHandler(async (req, res) => {
  const result = await socialService.unmatch(ownUserId(req), Number(req.params.matchId));
  sendSuccess(res, result, 'Profile unmatched and chat deleted');
});

/** GET /user/:userId/notifications[?unread=true] */
export const listNotifications = asyncHandler(async (req, res) => {
  const unreadOnly = req.query.unread === 'true';
  sendSuccess(res, await notificationService.listNotifications(ownUserId(req), { unreadOnly }), 'Notifications retrieved successfully');
});

/** PUT /user/:userId/notifications/:notificationId/read */
export const markNotificationRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markNotificationRead(ownUserId(req), Number(req.params.notificationId));
  sendSuccess(res, result, 'Notification marked as read');
});
