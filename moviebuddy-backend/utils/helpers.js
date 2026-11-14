/**
 * Wraps an async route handler/controller so rejected promises pass to Express error middleware.
 * @param {Function} fn - Async Express controller function.
 * @returns {Function} Wrapped Express middleware function.
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Generates the next sequential integer ID from an array of items with numeric `id` fields.
 * @param {Array<{id: number}>} items - Collection of items.
 * @returns {number} Next available ID.
 */
export const getNextId = (items) => {
  if (!items || items.length === 0) return 1;
  return Math.max(...items.map((item) => Number(item.id) || 0)) + 1;
};
