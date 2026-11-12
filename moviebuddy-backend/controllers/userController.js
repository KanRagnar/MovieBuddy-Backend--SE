import { MESSAGES } from '../config/constants.js';
import * as authService from '../services/authService.js';
import * as userService from '../services/userService.js';
import { BadRequestError } from '../utils/errors.js';
import { asyncHandler, assertOwner } from '../utils/helpers.js';
import { sendSuccess } from '../utils/responses.js';

/** GET /user - all users (the caller sees their own full profile, others as public profiles). */
export const listUsers = asyncHandler(async (req, res) => {
  sendSuccess(res, await userService.listUsers(req.user), 'Users retrieved successfully');
});

/** GET /user/:userId */
export const getUser = asyncHandler(async (req, res) => {
  sendSuccess(res, await userService.getUser(Number(req.params.userId), req.user), 'User retrieved successfully');
});

/** POST /user - register. */
export const createUser = asyncHandler(async (req, res) => {
  sendSuccess(res, await userService.createUser(req.body), 'User successfully created', 201);
});

/** PUT /user/:userId - edit profile (partial update). */
export const updateUser = asyncHandler(async (req, res) => {
  const id = Number(req.params.userId);
  assertOwner(req.user, id, 'You can only edit your own profile');
  sendSuccess(res, await userService.updateUser(id, req.body), MESSAGES.PROFILE_CHANGED);
});

/** DELETE /user/:userId */
export const deleteUser = asyncHandler(async (req, res) => {
  const id = Number(req.params.userId);
  assertOwner(req.user, id, 'You can only delete your own account');
  await userService.deleteUser(id);
  authService.revokeSessionsOf(id);
  sendSuccess(res, null, 'User successfully deleted');
});

/**
 * GET|POST /user/login - credentials come from the query string (swagger, GET)
 * or from the JSON body (POST, recommended: query strings end up in logs).
 */
export const login = asyncHandler(async (req, res) => {
  const username = req.query.username ?? req.body?.username;
  const password = req.query.password ?? req.body?.password;
  if (!username || !password) throw new BadRequestError('username and password are required', 'CREDENTIALS_REQUIRED');
  sendSuccess(res, await authService.login(username, password), 'User successfully logged in');
});

/** GET /user/logout - invalidates the bearer token. */
export const logout = asyncHandler(async (req, res) => {
  authService.logout(req.token);
  sendSuccess(res, null, 'User successfully logged out');
});

/** PUT /user/:userId/password */
export const updatePassword = asyncHandler(async (req, res) => {
  const id = Number(req.params.userId);
  assertOwner(req.user, id, 'You can only change your own password');
  await userService.updatePassword(id, req.body.password);
  sendSuccess(res, null, 'Password successfully updated');
});

/** PUT /user/:userId/email */
export const updateEmail = asyncHandler(async (req, res) => {
  const id = Number(req.params.userId);
  assertOwner(req.user, id, 'You can only change your own e-mail');
  await userService.updateEmail(id, req.body.email);
  sendSuccess(res, null, 'Email successfully updated');
});

/** PUT /user/:userId/location - share GPS location (grants the GPS permission). */
export const updateLocation = asyncHandler(async (req, res) => {
  const id = Number(req.params.userId);
  assertOwner(req.user, id, 'You can only update your own location');
  sendSuccess(res, await userService.updateLocation(id, req.body), 'Location successfully updated');
});

/** GET /user/:userId/favorites */
export const getFavorites = asyncHandler(async (req, res) => {
  const id = Number(req.params.userId);
  assertOwner(req.user, id, 'You can only see your own favorites');
  sendSuccess(res, await userService.listFavorites(id), 'Favorites retrieved successfully');
});

/** PUT /user/:userId/favorites/shown - choose the 4 favorites shown on the profile. */
export const setShownFavorites = asyncHandler(async (req, res) => {
  const id = Number(req.params.userId);
  assertOwner(req.user, id, 'You can only edit your own profile');
  sendSuccess(res, await userService.setShownFavorites(id, req.body.titleIds), MESSAGES.PROFILE_CHANGED);
});
