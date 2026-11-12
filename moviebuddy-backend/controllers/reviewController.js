import * as reviewService from '../services/reviewService.js';
import { sendSuccess } from '../utils/responses.js';
import { asyncHandler } from '../utils/helpers.js';
import { parseId } from '../utils/validators.js';

/**
 * GET /review - Retrieve all reviews (supports optional ?titleId=).
 */
export const getReviews = asyncHandler(async (req, res) => {
  const titleId = req.query.titleId ? parseId(req.query.titleId, 'titleId') : undefined;
  const reviews = await reviewService.getAllReviews(titleId);
  return sendSuccess(res, 200, reviews, 'Reviews retrieved successfully');
});

/**
 * POST /title/:titleId/Review - Add a review for a title.
 */
export const addReviewToTitle = asyncHandler(async (req, res) => {
  const titleId = parseId(req.params.titleId, 'titleId');
  const review = await reviewService.createReviewForTitle(titleId, req.body);
  return sendSuccess(res, 201, review, 'Review successfully submitted');
});

/**
 * GET /review/:reviewId - Get a review by ID.
 */
export const getReviewById = asyncHandler(async (req, res) => {
  const reviewId = parseId(req.params.reviewId, 'reviewId');
  const review = await reviewService.getReviewById(reviewId);
  return sendSuccess(res, 200, review, 'Review retrieved successfully');
});

/**
 * PUT /review/:reviewId - Update a review by ID.
 */
export const updateReview = asyncHandler(async (req, res) => {
  const reviewId = parseId(req.params.reviewId, 'reviewId');
  const updated = await reviewService.updateReviewById(reviewId, req.body);
  return sendSuccess(res, 200, updated, 'Review successfully updated');
});

/**
 * DELETE /review/:reviewId - Delete a review by ID.
 */
export const deleteReview = asyncHandler(async (req, res) => {
  const reviewId = parseId(req.params.reviewId, 'reviewId');
  await reviewService.deleteReviewById(reviewId);
  return sendSuccess(res, 200, { id: reviewId }, 'Review successfully deleted');
});
