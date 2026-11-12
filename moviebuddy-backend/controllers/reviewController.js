import { requireUser } from '../middleware/auth.js';
import * as reviewService from '../services/reviewService.js';
import { asyncHandler } from '../utils/helpers.js';
import { sendSuccess } from '../utils/responses.js';

/** POST /title/:titleId/Review - the caller reviews a title. */
export const createReview = asyncHandler(async (req, res) => {
  const review = await reviewService.createReview(Number(req.params.titleId), requireUser(req), req.body);
  sendSuccess(res, review, 'Review successfully submitted', 201);
});

/** GET /title/:titleId/reviews - all reviews of a title. */
export const listTitleReviews = asyncHandler(async (req, res) => {
  sendSuccess(res, await reviewService.listReviewsForTitle(Number(req.params.titleId)), 'Reviews retrieved successfully');
});

/** GET /review/:reviewId */
export const getReview = asyncHandler(async (req, res) => {
  sendSuccess(res, await reviewService.getReview(Number(req.params.reviewId)), 'Review retrieved successfully');
});

/** PUT /review/:reviewId - edit rate and/or comment. */
export const updateReview = asyncHandler(async (req, res) => {
  const review = await reviewService.updateReview(Number(req.params.reviewId), req.user, req.body);
  sendSuccess(res, review, 'Review successfully updated');
});

/** DELETE /review/:reviewId */
export const deleteReview = asyncHandler(async (req, res) => {
  await reviewService.deleteReview(Number(req.params.reviewId), req.user);
  sendSuccess(res, null, 'Review successfully deleted');
});
