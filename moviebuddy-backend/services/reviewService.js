import { getStore } from '../config/database.js';
import { ConflictError, NotFoundError } from '../utils/errors.js';
import { assertOwner, nowISO, todayISO } from '../utils/helpers.js';

/**
 * Loads a review or throws 404.
 * @param {number} id Review id.
 * @returns {Promise<object>} Review.
 */
async function getReviewOrThrow(id) {
  const review = await getStore().reviews.findById(id);
  if (!review) throw new NotFoundError('Review not found');
  return review;
}

/**
 * Creates the user's review of a title (one review per user per title).
 * @param {number} titleId Title id.
 * @param {{id:number}} user The reviewer.
 * @param {{rate:number, comment:string, date?:string}} data Validated body.
 * @returns {Promise<object>} Created review.
 * @throws {ConflictError} When the user already reviewed the title.
 */
export async function createReview(titleId, user, data) {
  const store = getStore();
  if (!(await store.titles.findById(titleId))) throw new NotFoundError('Title not found');
  if (await store.reviews.findOne({ titleId, userId: user.id })) {
    throw new ConflictError('You have already reviewed this title. Edit your review instead.', 'ALREADY_REVIEWED');
  }
  return store.reviews.create({ titleId, userId: user.id, rate: data.rate, comment: data.comment, date: data.date ?? todayISO(), updatedAt: null });
}

/**
 * Gets a review by id.
 * @param {number} id Review id.
 * @returns {Promise<object>} Review.
 */
export async function getReview(id) {
  return getReviewOrThrow(id);
}

/**
 * Lists the reviews of a title, newest first.
 * @param {number} titleId Title id.
 * @returns {Promise<object[]>} Reviews.
 */
export async function listReviewsForTitle(titleId) {
  if (!(await getStore().titles.findById(titleId))) throw new NotFoundError('Title not found');
  const reviews = await getStore().reviews.find({ titleId });
  return reviews.sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
}

/**
 * Updates the rate and/or comment of a review.
 * @param {number} id Review id.
 * @param {{id:number}|null} actor The acting user (must own the review when auth is enforced).
 * @param {{rate?:number, comment?:string}} data Validated body.
 * @returns {Promise<object>} Updated review.
 */
export async function updateReview(id, actor, data) {
  const review = await getReviewOrThrow(id);
  assertOwner(actor, review.userId, 'You can only edit your own reviews');
  const patch = { updatedAt: nowISO() };
  if (data.rate !== undefined) patch.rate = data.rate;
  if (data.comment !== undefined) patch.comment = data.comment;
  return getStore().reviews.update(id, patch);
}

/**
 * Deletes a review.
 * @param {number} id Review id.
 * @param {{id:number}|null} actor The acting user (must own the review when auth is enforced).
 * @returns {Promise<void>}
 */
export async function deleteReview(id, actor) {
  const review = await getReviewOrThrow(id);
  assertOwner(actor, review.userId, 'You can only delete your own reviews');
  await getStore().reviews.remove(id);
}
