import Title from '../models/Title.js';
import User from '../models/User.js';
import { mockTitles, mockUsers } from '../config/constants.js';
import { getDbStatus } from '../config/database.js';
import { AppError } from '../utils/validators.js';

const titlesStore = [...mockTitles];

/**
 * Retrieves all titles, optionally filtered by genre/category.
 * @param {string} [genre] - Optional genre filter.
 * @returns {Promise<Array<Object>>} List of titles.
 */
export const getAllTitles = async (genre) => {
  if (getDbStatus()) {
    const filter = genre ? { genre: new RegExp(`^${genre}$`, 'i') } : {};
    return await Title.find(filter).lean();
  }
  if (genre) {
    return titlesStore.filter((t) => t.genre.toLowerCase() === genre.toLowerCase());
  }
  return titlesStore;
};

/**
 * Retrieves a single title by numeric ID.
 * @param {number} titleId - Title ID.
 * @returns {Promise<Object>} Found title object.
 */
export const getTitleById = async (titleId) => {
  let title;
  if (getDbStatus()) {
    title = await Title.findOne({ id: titleId }).lean();
  } else {
    title = titlesStore.find((t) => t.id === titleId);
  }
  if (!title) {
    throw new AppError(`Title with ID ${titleId} not found`, 404);
  }
  return title;
};

/**
 * Searches titles by keyword in title or description and optional genre.
 * @param {string} query - Search keyword.
 * @param {string} [genre] - Optional category/genre filter.
 * @returns {Promise<Array<Object>>} Matching titles.
 */
export const searchTitles = async (query, genre) => {
  if (!query || query.trim() === '') {
    throw new AppError('Search query parameter is required', 400);
  }
  const q = query.trim().toLowerCase();

  if (getDbStatus()) {
    const mongoQuery = {
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ]
    };
    if (genre) mongoQuery.genre = new RegExp(`^${genre}$`, 'i');
    return await Title.find(mongoQuery).lean();
  }

  return titlesStore.filter((t) => {
    const matchesKeyword =
      t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
    const matchesGenre = genre ? t.genre.toLowerCase() === genre.toLowerCase() : true;
    return matchesKeyword && matchesGenre;
  });
};

/**
 * Adds a title to a user's favorite movies list.
 * @param {number} titleId - Title ID to add.
 * @param {number} [userId=1] - User numeric ID.
 * @returns {Promise<Object>} Updated favorite IDs list.
 */
export const addTitleToFavorites = async (titleId, userId = 1) => {
  await getTitleById(titleId);

  if (getDbStatus()) {
    const user = await User.findOne({ id: userId });
    if (!user) throw new AppError(`User with ID ${userId} not found`, 404);
    if (user.favoriteMovies.includes(titleId)) {
      throw new AppError('This title is already in your favorite list', 400);
    }
    user.favoriteMovies.push(titleId);
    await user.save();
    return { userId: user.id, favoriteMovies: user.favoriteMovies };
  }

  const user = mockUsers.find((u) => u.id === userId) || mockUsers[0];
  if (!user) throw new AppError('User not found', 404);
  if (user.favoriteMovies.includes(titleId)) {
    throw new AppError('This title is already in your favorite list', 400);
  }
  user.favoriteMovies.push(titleId);
  return { userId: user.id, favoriteMovies: user.favoriteMovies };
};

/**
 * Removes a title from a user's favorite movies list.
 * @param {number} titleId - Title ID to remove.
 * @param {number} [userId=1] - User numeric ID.
 * @returns {Promise<Object>} Updated favorite IDs list.
 */
export const removeTitleFromFavorites = async (titleId, userId = 1) => {
  await getTitleById(titleId);

  if (getDbStatus()) {
    const user = await User.findOne({ id: userId });
    if (!user) throw new AppError(`User with ID ${userId} not found`, 404);
    user.favoriteMovies = user.favoriteMovies.filter((id) => id !== titleId);
    await user.save();
    return { userId: user.id, favoriteMovies: user.favoriteMovies };
  }

  const user = mockUsers.find((u) => u.id === userId) || mockUsers[0];
  if (!user) throw new AppError('User not found', 404);
  user.favoriteMovies = user.favoriteMovies.filter((id) => id !== titleId);
  return { userId: user.id, favoriteMovies: user.favoriteMovies };
};
