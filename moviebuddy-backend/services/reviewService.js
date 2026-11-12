import Review from '../models/Review.js';
import { mockReviews } from '../config/constants.js';
import { getDbStatus } from '../config/database.js';
import { getTitleById } from './titleService.js';
import { AppError } from '../utils/validators.js';
import { getNextId } from '../utils/helpers.js';

const reviewsStore = [...mockReviews];

/**
 * Retrieves all reviews, optionally filtered by titleId.
 * @param {number} [titleId] - Optional title ID filter.
 * @returns {Promise<Array<Object>>} List of reviews.
 */
export const getAllReviews = async (titleId) => {
  if (getDbStatus()) {
    const filter = titleId ? { titleId } : {};
    return await Review.find(filter).lean();
  }
  if (titleId) {
    return reviewsStore.filter((r) => r.titleId === titleId);
  }
  return reviewsStore;
};

/**
 * Retrieves a review by ID.
 * @param {number} reviewId - Review numeric ID.
 * @returns {Promise<Object>} Review object.
 */
export const getReviewById = async (reviewId) => {
  let review;
  if (getDbStatus()) {
    review = await Review.findOne({ id: reviewId }).lean();
  } else {
    review = reviewsStore.find((r) => r.id === reviewId);
  }
  if (!review) {
    throw new AppError(`Review with ID ${reviewId} not found`, 404);
  }
  return review;
};

/**
 * Creates a new review for a specific title.
 * @param {number} titleId - Title ID being reviewed.
 * @param {Object} reviewData - Review payload { comment, rate, date, userId }.
 * @returns {Promise<Object>} Created review.
 */
export const createReviewForTitle = async (titleId, reviewData) => {
  await getTitleById(titleId);

  const dateStr = reviewData.date || new Date().toISOString().split('T')[0];

  if (getDbStatus()) {
    const all = await Review.find().lean();
    const newId = getNextId(all);
    const created = await Review.create({
      id: newId,
      titleId,
      userId: reviewData.userId || 1,
      comment: reviewData.comment.trim(),
      rate: Number(reviewData.rate),
      date: dateStr
    });
    return created.toObject();
  }

  const newReview = {
    id: getNextId(reviewsStore),
    titleId,
    userId: reviewData.userId || 1,
    comment: reviewData.comment.trim(),
    rate: Number(reviewData.rate),
    date: dateStr
  };
  reviewsStore.push(newReview);
  return newReview;
};

/**
 * Updates an existing review by ID.
 * @param {number} reviewId - Review ID.
 * @param {Object} updateData - Updated { comment, rate, date }.
 * @returns {Promise<Object>} Updated review.
 */
export const updateReviewById = async (reviewId, updateData) => {
  if (getDbStatus()) {
    const updated = await Review.findOneAndUpdate(
      { id: reviewId },
      {
        $set: {
          comment: updateData.comment.trim(),
          rate: Number(updateData.rate),
          date: updateData.date || new Date().toISOString().split('T')[0]
        }
      },
      { new: true }
    ).lean();
    if (!updated) throw new AppError(`Review with ID ${reviewId} not found`, 404);
    return updated;
  }

  const index = reviewsStore.findIndex((r) => r.id === reviewId);
  if (index === -1) {
    throw new AppError(`Review with ID ${reviewId} not found`, 404);
  }
  reviewsStore[index] = {
    ...reviewsStore[index],
    comment: updateData.comment.trim(),
    rate: Number(updateData.rate),
    date: updateData.date || reviewsStore[index].date
  };
  return reviewsStore[index];
};

/**
 * Deletes a review by ID.
 * @param {number} reviewId - Review ID.
 * @returns {Promise<boolean>} True if deleted.
 */
export const deleteReviewById = async (reviewId) => {
  if (getDbStatus()) {
    const deleted = await Review.findOneAndDelete({ id: reviewId });
    if (!deleted) throw new AppError(`Review with ID ${reviewId} not found`, 404);
    return true;
  }

  const index = reviewsStore.findIndex((r) => r.id === reviewId);
  if (index === -1) {
    throw new AppError(`Review with ID ${reviewId} not found`, 404);
  }
  reviewsStore.splice(index, 1);
  return true;
};
