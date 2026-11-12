import { MESSAGES } from '../config/constants.js';
import { requireUser } from '../middleware/auth.js';
import * as titleService from '../services/titleService.js';
import * as userService from '../services/userService.js';
import { BadRequestError } from '../utils/errors.js';
import { asyncHandler } from '../utils/helpers.js';
import { sendSuccess } from '../utils/responses.js';

/** GET /title - list titles, optionally filtered by `?genre=Drama,Comedy`. */
export const listTitles = asyncHandler(async (req, res) => {
  const titles = await titleService.listTitles({ genre: req.query.genre });
  sendSuccess(res, titles, titles.length ? 'Titles retrieved successfully' : MESSAGES.NOTHING_MATCHES);
});

/** GET /title/genres - categories available for filtering. */
export const listGenres = asyncHandler(async (_req, res) => {
  sendSuccess(res, await titleService.listGenres(), 'Genres retrieved successfully');
});

/** GET /title/search?query=...&genre=... - keyword search. */
export const searchTitles = asyncHandler(async (req, res) => {
  const query = String(req.query.query ?? '').trim();
  if (!query) throw new BadRequestError('Query parameter "query" is required', 'QUERY_REQUIRED');
  const titles = await titleService.searchTitles({ query, genre: req.query.genre });
  sendSuccess(res, titles, titles.length ? 'Titles retrieved successfully' : MESSAGES.NOTHING_MATCHES);
});

/** GET /title/:titleId - title details with reviews. */
export const getTitle = asyncHandler(async (req, res) => {
  sendSuccess(res, await titleService.getTitleById(Number(req.params.titleId)), 'Title retrieved successfully');
});

/** POST /title - add a title (simulates a TMDB sync) and notify users. */
export const createTitle = asyncHandler(async (req, res) => {
  const { title, notificationsSent } = await titleService.createTitle(req.body);
  sendSuccess(res, { ...title, notificationsSent }, 'Title created successfully', 201);
});

/** POST /title/:titleId/AddToFavorites - add to the caller's favorites. */
export const addToFavorites = asyncHandler(async (req, res) => {
  const result = await userService.addFavorite(requireUser(req).id, Number(req.params.titleId));
  sendSuccess(res, result, 'Successfully added to favorites');
});

/** DELETE /title/:titleId/AddToFavorites - remove from the caller's favorites. */
export const removeFromFavorites = asyncHandler(async (req, res) => {
  const result = await userService.removeFavorite(requireUser(req).id, Number(req.params.titleId));
  sendSuccess(res, result, 'Successfully removed from favorites');
});
