import * as titleService from '../services/titleService.js';
import { sendSuccess } from '../utils/responses.js';
import { asyncHandler } from '../utils/helpers.js';
import { parseId } from '../utils/validators.js';

/**
 * GET /title - Retrieve all titles (supports optional ?genre= query filter).
 */
export const getTitles = asyncHandler(async (req, res) => {
  const { genre } = req.query;
  const titles = await titleService.getAllTitles(genre);
  return sendSuccess(res, 200, titles, 'Titles retrieved successfully');
});

/**
 * GET /title/search - Search titles by keyword (?query=...).
 */
export const searchTitles = asyncHandler(async (req, res) => {
  const { query, genre } = req.query;
  const results = await titleService.searchTitles(query, genre);
  const message = results.length === 0 ? 'Sorry! Nothing matches' : 'Search completed successfully';
  return sendSuccess(res, 200, results, message);
});

/**
 * GET /title/:titleId - Get a specific title by ID.
 */
export const getTitleById = asyncHandler(async (req, res) => {
  const titleId = parseId(req.params.titleId, 'titleId');
  const title = await titleService.getTitleById(titleId);
  return sendSuccess(res, 200, title, 'Title retrieved successfully');
});

/**
 * POST /title/:titleId/AddToFavorites - Add a title to user's favorites.
 */
export const addToFavorites = asyncHandler(async (req, res) => {
  const titleId = parseId(req.params.titleId, 'titleId');
  const userId = req.body?.userId ? Number(req.body.userId) : req.currentUser?.id || 1;
  const result = await titleService.addTitleToFavorites(titleId, userId);
  return sendSuccess(res, 200, result, 'Successfully added to favorites');
});

/**
 * DELETE /title/:titleId/AddToFavorites - Remove a title from user's favorites.
 */
export const removeFromFavorites = asyncHandler(async (req, res) => {
  const titleId = parseId(req.params.titleId, 'titleId');
  const userId = req.query?.userId ? Number(req.query.userId) : req.currentUser?.id || 1;
  const result = await titleService.removeTitleFromFavorites(titleId, userId);
  return sendSuccess(res, 200, result, 'Successfully removed from favorites');
});
