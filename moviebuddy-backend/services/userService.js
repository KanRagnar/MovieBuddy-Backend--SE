import User from '../models/User.js';
import { mockUsers, mockTitles } from '../config/constants.js';
import { getDbStatus } from '../config/database.js';
import { AppError } from '../utils/validators.js';
import { getNextId } from '../utils/helpers.js';

/**
 * Hydrates a user object by resolving favoriteMovies IDs into full title objects and stripping password.
 * @param {Object} user - Raw user object.
 * @returns {Object} Sanitized and enriched user object.
 */
const formatUserOutput = (user) => {
  const { password, _id, __v, ...safeUser } = user;
  const resolvedFavorites = (safeUser.favoriteMovies || []).map((fav) => {
    if (typeof fav === 'object' && fav !== null) return fav;
    return mockTitles.find((t) => t.id === Number(fav)) || { id: fav, title: `Title #${fav}` };
  });
  return {
    ...safeUser,
    favoriteMovies: resolvedFavorites
  };
};

/**
 * Retrieves all users.
 * @returns {Promise<Array<Object>>} List of users.
 */
export const getAllUsers = async () => {
  if (getDbStatus()) {
    const users = await User.find().lean();
    return users.map(formatUserOutput);
  }
  return mockUsers.map(formatUserOutput);
};

/**
 * Retrieves a user by numeric ID.
 * @param {number} id - User numeric ID.
 * @returns {Promise<Object>} User object.
 */
export const getUserById = async (id) => {
  let user;
  if (getDbStatus()) {
    user = await User.findOne({ id }).lean();
  } else {
    user = mockUsers.find((u) => u.id === id);
  }
  if (!user) {
    throw new AppError(`User with ID ${id} not found`, 404);
  }
  return formatUserOutput(user);
};

/**
 * Creates a new user account.
 * @param {Object} userData - User fields.
 * @returns {Promise<Object>} Created user object.
 */
export const createUser = async (userData) => {
  if (getDbStatus()) {
    const existing = await User.findOne({ userId: userData.userId }).lean();
    if (existing) throw new AppError(`Username '${userData.userId}' already exists`, 409);
    const all = await User.find().lean();
    const newUser = await User.create({
      ...userData,
      id: getNextId(all)
    });
    return formatUserOutput(newUser.toObject());
  }

  if (mockUsers.some((u) => u.userId === userData.userId)) {
    throw new AppError(`Username '${userData.userId}' already exists`, 409);
  }
  const newUser = {
    id: getNextId(mockUsers),
    userId: userData.userId,
    name: userData.name,
    age: Number(userData.age),
    email: userData.email || `${userData.userId}@moviebuddy.gr`,
    password: userData.password || 'samplepassword',
    favoriteMovies: userData.favoriteMovies || [],
    madeIn: userData.madeIn || '',
    job: userData.job || '',
    into: userData.into || '',
    education: userData.education || '',
    sex: userData.sex || '',
    isVisible: userData.isVisible !== undefined ? Boolean(userData.isVisible) : true,
    likedUsers: [],
    matchedUsers: [],
    images: userData.images || []
  };
  mockUsers.push(newUser);
  return formatUserOutput(newUser);
};

/**
 * Updates a user profile by numeric ID.
 * @param {number} id - User numeric ID.
 * @param {Object} updateData - Fields to update.
 * @returns {Promise<Object>} Updated user object.
 */
export const updateUserById = async (id, updateData) => {
  const { id: ignoredId, password, ...allowedUpdates } = updateData;

  if (getDbStatus()) {
    const updated = await User.findOneAndUpdate(
      { id },
      { $set: allowedUpdates },
      { new: true }
    ).lean();
    if (!updated) throw new AppError(`User with ID ${id} not found`, 404);
    return formatUserOutput(updated);
  }

  const index = mockUsers.findIndex((u) => u.id === id);
  if (index === -1) {
    throw new AppError(`User with ID ${id} not found`, 404);
  }
  mockUsers[index] = {
    ...mockUsers[index],
    ...allowedUpdates
  };
  return formatUserOutput(mockUsers[index]);
};

/**
 * Deletes a user by numeric ID.
 * @param {number} id - User numeric ID.
 * @returns {Promise<boolean>} True if deleted.
 */
export const deleteUserById = async (id) => {
  if (getDbStatus()) {
    const deleted = await User.findOneAndDelete({ id });
    if (!deleted) throw new AppError(`User with ID ${id} not found`, 404);
    return true;
  }

  const index = mockUsers.findIndex((u) => u.id === id);
  if (index === -1) {
    throw new AppError(`User with ID ${id} not found`, 404);
  }
  mockUsers.splice(index, 1);
  return true;
};

/**
 * Authenticates a user with username (userId) and password.
 * @param {string} username - User's userId.
 * @param {string} password - User's password.
 * @returns {Promise<Object>} Authenticated user details and mock session token.
 */
export const loginUser = async (username, password) => {
  if (!username || !password) {
    throw new AppError('Username and password are required', 400);
  }
  let user;
  if (getDbStatus()) {
    user = await User.findOne({ userId: username }).lean();
  } else {
    user = mockUsers.find((u) => u.userId === username);
  }

  if (!user || user.password !== password) {
    throw new AppError('Invalid username or password', 401);
  }

  return {
    user: formatUserOutput(user),
    token: `moviebuddy-token-${user.id}-${Date.now()}`
  };
};

/**
 * Updates a user's password.
 * @param {number} id - User numeric ID.
 * @param {string} newPassword - New password string.
 * @returns {Promise<boolean>} True if updated.
 */
export const updateUserPassword = async (id, newPassword) => {
  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 4) {
    throw new AppError('Password must be at least 4 characters long', 400);
  }
  if (getDbStatus()) {
    const updated = await User.findOneAndUpdate({ id }, { $set: { password: newPassword } });
    if (!updated) throw new AppError(`User with ID ${id} not found`, 404);
    return true;
  }
  const user = mockUsers.find((u) => u.id === id);
  if (!user) throw new AppError(`User with ID ${id} not found`, 404);
  user.password = newPassword;
  return true;
};

/**
 * Updates a user's email address.
 * @param {number} id - User numeric ID.
 * @param {string} newEmail - New email string.
 * @returns {Promise<boolean>} True if updated.
 */
export const updateUserEmail = async (id, newEmail) => {
  if (!newEmail || !newEmail.includes('@')) {
    throw new AppError('A valid email address is required', 400);
  }
  if (getDbStatus()) {
    const updated = await User.findOneAndUpdate({ id }, { $set: { email: newEmail } });
    if (!updated) throw new AppError(`User with ID ${id} not found`, 404);
    return true;
  }
  const user = mockUsers.find((u) => u.id === id);
  if (!user) throw new AppError(`User with ID ${id} not found`, 404);
  user.email = newEmail;
  return true;
};

/**
 * Records a swipe action (left or right) from one user toward another and checks for mutual match.
 * @param {number} userId - Acting user's numeric ID.
 * @param {number} targetUserId - Target user's numeric ID.
 * @param {string} direction - 'right' (like) or 'left' (skip).
 * @returns {Promise<Object>} Swipe outcome including whether a match occurred.
 */
export const swipeProfile = async (userId, targetUserId, direction) => {
  if (!['left', 'right'].includes(direction)) {
    throw new AppError("Swipe direction must be 'left' or 'right'", 400);
  }
  if (userId === targetUserId) {
    throw new AppError('Cannot swipe on your own profile', 400);
  }

  if (getDbStatus()) {
    const user = await User.findOne({ id: userId });
    const target = await User.findOne({ id: targetUserId });
    if (!user || !target) throw new AppError('User or target profile not found', 404);

    let matched = false;
    if (direction === 'right') {
      if (!user.likedUsers.includes(targetUserId)) user.likedUsers.push(targetUserId);
      if (target.likedUsers.includes(userId)) {
        matched = true;
        if (!user.matchedUsers.includes(targetUserId)) user.matchedUsers.push(targetUserId);
        if (!target.matchedUsers.includes(userId)) target.matchedUsers.push(userId);
        await target.save();
      }
      await user.save();
    }
    return { userId, targetUserId, direction, matched };
  }

  const user = mockUsers.find((u) => u.id === userId);
  const target = mockUsers.find((u) => u.id === targetUserId);
  if (!user || !target) throw new AppError('User or target profile not found', 404);

  let matched = false;
  if (direction === 'right') {
    if (!user.likedUsers.includes(targetUserId)) user.likedUsers.push(targetUserId);
    if (target.likedUsers.includes(userId)) {
      matched = true;
      if (!user.matchedUsers.includes(targetUserId)) user.matchedUsers.push(targetUserId);
      if (!target.matchedUsers.includes(userId)) target.matchedUsers.push(userId);
    }
  }
  return { userId, targetUserId, direction, matched };
};
