import * as userService from '../services/userService.js';
import { sendSuccess } from '../utils/responses.js';
import { asyncHandler } from '../utils/helpers.js';
import { parseId } from '../utils/validators.js';

/**
 * GET /user - Get all users.
 */
export const getUsers = asyncHandler(async (req, res) => {
  const users = await userService.getAllUsers();
  return sendSuccess(res, 200, users, 'Users retrieved successfully');
});

/**
 * POST /user - Create a new user account.
 */
export const createUser = asyncHandler(async (req, res) => {
  const created = await userService.createUser(req.body);
  return sendSuccess(res, 201, created, 'User successfully created');
});

/**
 * GET /user/login - Log in a user via query params (?username=&password=).
 */
export const loginUser = asyncHandler(async (req, res) => {
  const { username, password } = req.query;
  const authResult = await userService.loginUser(username, password);
  return sendSuccess(res, 200, authResult, 'User successfully logged in');
});

/**
 * GET /user/logout - Log out the currently logged-in user.
 */
export const logoutUser = asyncHandler(async (req, res) => {
  return sendSuccess(res, 200, { loggedOut: true }, 'User successfully logged out');
});

/**
 * GET /user/:userId - Get a user by numeric ID.
 */
export const getUserById = asyncHandler(async (req, res) => {
  const userId = parseId(req.params.userId, 'userId');
  const user = await userService.getUserById(userId);
  return sendSuccess(res, 200, user, 'User retrieved successfully');
});

/**
 * PUT /user/:userId - Update a user profile by ID.
 */
export const updateUser = asyncHandler(async (req, res) => {
  const userId = parseId(req.params.userId, 'userId');
  const updated = await userService.updateUserById(userId, req.body);
  return sendSuccess(res, 200, updated, 'Profile changed successfully');
});

/**
 * DELETE /user/:userId - Delete a user by ID.
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const userId = parseId(req.params.userId, 'userId');
  await userService.deleteUserById(userId);
  return sendSuccess(res, 200, { id: userId }, 'User successfully deleted');
});

/**
 * PUT /user/:userId/password - Update user password.
 */
export const updatePassword = asyncHandler(async (req, res) => {
  const userId = parseId(req.params.userId, 'userId');
  await userService.updateUserPassword(userId, req.body.password);
  return sendSuccess(res, 200, { userId }, 'Password successfully updated');
});

/**
 * PUT /user/:userId/email - Update user email.
 */
export const updateEmail = asyncHandler(async (req, res) => {
  const userId = parseId(req.params.userId, 'userId');
  await userService.updateUserEmail(userId, req.body.email);
  return sendSuccess(res, 200, { userId }, 'Email successfully updated');
});

/**
 * POST /user/:userId/swipe - Swipe right/left on another user's profile.
 */
export const swipeUserProfile = asyncHandler(async (req, res) => {
  const userId = parseId(req.params.userId, 'userId');
  const targetUserId = parseId(req.body.targetUserId, 'targetUserId');
  const result = await userService.swipeProfile(userId, targetUserId, req.body.direction);
  const msg = result.matched ? "It's a Match! You can now chat." : 'Swipe recorded';
  return sendSuccess(res, 200, result, msg);
});
