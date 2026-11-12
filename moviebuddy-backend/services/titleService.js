import { getStore } from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';
import { round1 } from '../utils/helpers.js';
import { notifyNewTitle } from './notificationService.js';

/**
 * Splits a comma separated query value into lower-cased, trimmed items.
 * @param {string|undefined} value Raw value, e.g. "Drama,Comedy".
 * @returns {string[]} Items.
 */
const splitCsv = (value) =>
  String(value ?? '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

/**
 * Adds `averageRating` and `reviewCount` (from our users' reviews) to titles.
 * @param {object[]} titles Titles.
 * @returns {Promise<object[]>} Titles with rating summary.
 */
async function withRatings(titles) {
  const reviews = await getStore().reviews.find();
  const stats = new Map();
  for (const review of reviews) {
    const entry = stats.get(review.titleId) ?? { sum: 0, count: 0 };
    entry.sum += review.rate;
    entry.count += 1;
    stats.set(review.titleId, entry);
  }
  return titles.map((title) => {
    const entry = stats.get(title.id);
    return { ...title, averageRating: entry ? round1(entry.sum / entry.count) : null, reviewCount: entry?.count ?? 0 };
  });
}

/**
 * Keeps only the titles whose genre is in the (comma separated) genre filter.
 * @param {object[]} titles Titles.
 * @param {string|undefined} genre Genre filter, e.g. "Drama,Comedy".
 * @returns {object[]} Filtered titles.
 */
function filterByGenre(titles, genre) {
  const genres = splitCsv(genre);
  if (genres.length === 0) return titles;
  return titles.filter((title) => genres.includes(String(title.genre ?? '').toLowerCase()));
}

/**
 * Lists titles, optionally filtered by category (genre).
 * @param {{genre?: string}} [filters] Filters.
 * @returns {Promise<object[]>} Titles.
 */
export async function listTitles({ genre } = {}) {
  return withRatings(filterByGenre(await getStore().titles.find(), genre));
}

/**
 * Searches titles by keywords: every word must appear in the title, description or genre.
 * @param {{query: string, genre?: string}} params Search params.
 * @returns {Promise<object[]>} Matching titles (possibly empty).
 */
export async function searchTitles({ query, genre }) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const titles = filterByGenre(await getStore().titles.find(), genre).filter((title) => {
    const haystack = `${title.title} ${title.description} ${title.genre ?? ''}`.toLowerCase();
    return words.every((word) => haystack.includes(word));
  });
  return withRatings(titles);
}

/**
 * Returns the distinct genres (categories) available for filtering.
 * @returns {Promise<string[]>} Sorted genres.
 */
export async function listGenres() {
  const titles = await getStore().titles.find();
  return [...new Set(titles.map((t) => t.genre).filter(Boolean))].sort();
}

/**
 * Gets one title with its reviews and rating summary.
 * @param {number} id Title id.
 * @returns {Promise<object>} Title details.
 * @throws {NotFoundError} When the title does not exist.
 */
export async function getTitleById(id) {
  const title = await getStore().titles.findById(id);
  if (!title) throw new NotFoundError('Title not found');
  const [withRating] = await withRatings([title]);
  const reviews = await getStore().reviews.find({ titleId: id });
  return { ...withRating, reviews };
}

/**
 * Adds a title (simulates a sync from The Movie Database) and notifies users.
 * @param {object} data Validated body.
 * @returns {Promise<{title: object, notificationsSent: number}>} Created title.
 */
export async function createTitle(data) {
  const title = await getStore().titles.create({
    title: data.title.trim(),
    poster: data.poster ?? null,
    description: data.description,
    releaseDate: data.releaseDate ?? null,
    duration: data.duration ?? null,
    numOfSeasons: data.numOfSeasons ?? null,
    numOfEpisodes: data.numOfEpisodes ?? null,
    genre: data.genre ?? null,
    externalRatings: data.externalRatings ?? null
  });
  const notificationsSent = await notifyNewTitle(title);
  return { title, notificationsSent };
}
