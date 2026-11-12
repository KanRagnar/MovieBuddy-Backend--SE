import { getStore } from '../config/database.js';
import { MIN_FAVORITES_TO_SHOW, SHOWN_FAVORITES_COUNT } from '../config/constants.js';
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from '../utils/errors.js';
import { hashPassword, nowISO, pick } from '../utils/helpers.js';

const PROFILE_FIELDS = ['name', 'age', 'sex', 'madeIn', 'job', 'into', 'education', 'images', 'visible', 'notificationsEnabled'];

/**
 * Resolves a user reference: a numeric id, a username (`userId`) or an object containing either.
 * @param {number|string|{id?: number, userId?: string}|null|undefined} ref User reference.
 * @returns {Promise<object|null>} Raw user document or null.
 */
export async function resolveUserRef(ref) {
  if (ref === null || ref === undefined) return null;
  const value = typeof ref === 'object' ? (ref.id ?? ref.userId) : ref;
  if (value === undefined || value === null || value === '') return null;
  if (typeof value === 'number' || /^\d+$/.test(String(value))) return getStore().users.findById(Number(value));
  return getStore().users.findOne({ userId: String(value) });
}

/**
 * Loads a user or throws 404.
 * @param {number} id User id.
 * @returns {Promise<object>} Raw user document.
 */
export async function getUserOrThrow(id) {
  const user = await getStore().users.findById(id);
  if (!user) throw new NotFoundError('User not found');
  return user;
}

/**
 * Converts a list of title references (ids or objects with an id) into unique, existing title ids.
 * @param {Array<number|{id:number}>} list Title references.
 * @returns {Promise<number[]>} Title ids.
 * @throws {BadRequestError} When a reference is invalid or a title does not exist.
 */
async function resolveTitleIds(list) {
  const ids = [...new Set(list.map((entry) => Number(typeof entry === 'object' && entry !== null ? entry.id : entry)))];
  if (ids.some((id) => !Number.isInteger(id) || id <= 0)) throw new BadRequestError('favoriteMovies must contain valid title ids');
  const titles = await getStore().titles.find();
  const known = new Set(titles.map((t) => t.id));
  const missing = ids.filter((id) => !known.has(id));
  if (missing.length) throw new BadRequestError(`Unknown title id(s): ${missing.join(', ')}`);
  return ids;
}

/**
 * Builds the public view of a user (what other people see while swiping).
 * @param {object} user Raw user.
 * @param {Map<number, object>} titlesById Titles lookup.
 * @returns {object} Public profile.
 */
function toPublicProfile(user, titlesById) {
  const shownIds = user.shownFavoriteIds?.length ? user.shownFavoriteIds : (user.favoriteTitleIds ?? []).slice(0, SHOWN_FAVORITES_COUNT);
  const favoriteMovies = shownIds.map((id) => titlesById.get(id)).filter(Boolean);
  return {
    id: user.id,
    userId: user.userId,
    name: user.name,
    age: user.age,
    sex: user.sex,
    madeIn: user.madeIn,
    job: user.job,
    into: user.into,
    education: user.education,
    images: user.images ?? [],
    favoriteMovies
  };
}

/**
 * Builds the full view of a user (shown only to the user themselves). Never includes the password hash.
 * @param {object} user Raw user.
 * @param {Map<number, object>} titlesById Titles lookup.
 * @returns {object} Full profile.
 */
function toOwnProfile(user, titlesById) {
  const { passwordHash, favoriteTitleIds = [], shownFavoriteIds = [], ...rest } = user;
  const resolve = (ids) => ids.map((id) => titlesById.get(id)).filter(Boolean);
  return { ...rest, favoriteMovies: resolve(favoriteTitleIds), shownFavoriteMovies: resolve(shownFavoriteIds) };
}

/**
 * Loads all titles as an id lookup.
 * @returns {Promise<Map<number, object>>} Titles by id.
 */
async function loadTitlesById() {
  const titles = await getStore().titles.find();
  return new Map(titles.map((t) => [t.id, t]));
}

/**
 * Serializes users for an API response. The viewer gets the full profile of
 * themselves and the public profile of everybody else.
 * @param {object[]} users Raw users.
 * @param {{id:number}|null} viewer User making the request.
 * @returns {Promise<object[]>} API users.
 */
export async function serializeUsers(users, viewer = null) {
  const titlesById = await loadTitlesById();
  return users.map((u) => (viewer && viewer.id === u.id ? toOwnProfile(u, titlesById) : toPublicProfile(u, titlesById)));
}

/**
 * Serializes users as public profiles only (used for swiping and matches).
 * @param {object[]} users Raw users.
 * @returns {Promise<object[]>} Public profiles.
 */
export async function serializePublicProfiles(users) {
  const titlesById = await loadTitlesById();
  return users.map((u) => toPublicProfile(u, titlesById));
}

/**
 * Serializes a single user for the given viewer.
 * @param {object} user Raw user.
 * @param {{id:number}|null} viewer User making the request.
 * @returns {Promise<object>} API user.
 */
export async function serializeUser(user, viewer = null) {
  return (await serializeUsers([user], viewer))[0];
}

/**
 * Lists all users.
 * @param {{id:number}|null} viewer User making the request.
 * @returns {Promise<object[]>} API users.
 */
export async function listUsers(viewer) {
  return serializeUsers(await getStore().users.find(), viewer);
}

/**
 * Gets one user.
 * @param {number} id User id.
 * @param {{id:number}|null} viewer User making the request.
 * @returns {Promise<object>} API user.
 */
export async function getUser(id, viewer) {
  return serializeUser(await getUserOrThrow(id), viewer);
}

/**
 * Registers a new user.
 * @param {object} data Validated body (userId, name, age, optional profile fields, email, password).
 * @returns {Promise<object>} The new user's own profile.
 * @throws {ConflictError} When the username or e-mail is already taken.
 */
export async function createUser(data) {
  const store = getStore();
  if (await store.users.findOne({ userId: data.userId })) throw new ConflictError('This userId is already taken', 'USER_EXISTS');
  if (data.email && (await store.users.findOne({ email: data.email }))) throw new ConflictError('This e-mail is already registered', 'EMAIL_EXISTS');

  const favoriteTitleIds = await resolveTitleIds(data.favoriteMovies ?? []);
  const user = await store.users.create({
    userId: data.userId,
    name: data.name.trim(),
    age: data.age,
    email: data.email ?? null,
    passwordHash: data.password ? hashPassword(data.password) : null,
    sex: data.sex ?? null,
    madeIn: data.madeIn ?? null,
    job: data.job ?? null,
    into: data.into ?? null,
    education: data.education ?? null,
    images: data.images ?? [],
    favoriteTitleIds,
    shownFavoriteIds: [],
    visible: data.visible ?? true,
    notificationsEnabled: data.notificationsEnabled ?? true,
    gpsEnabled: false,
    location: null,
    createdAt: nowISO()
  });
  return serializeUser(user, user);
}

/**
 * Updates profile fields (partial update, only the sent fields change).
 * Password, e-mail and location have dedicated endpoints.
 * @param {number} id User id.
 * @param {object} data Validated body.
 * @returns {Promise<object>} Updated own profile.
 */
export async function updateUser(id, data) {
  const store = getStore();
  const user = await getUserOrThrow(id);
  const patch = pick(data, PROFILE_FIELDS);

  if (data.userId !== undefined && data.userId !== user.userId) {
    if (await store.users.findOne({ userId: data.userId })) throw new ConflictError('This userId is already taken', 'USER_EXISTS');
    patch.userId = data.userId;
  }
  if (data.favoriteMovies !== undefined) {
    patch.favoriteTitleIds = await resolveTitleIds(data.favoriteMovies);
    patch.shownFavoriteIds = (user.shownFavoriteIds ?? []).filter((titleId) => patch.favoriteTitleIds.includes(titleId));
  }
  if (data.gpsEnabled === false) {
    patch.gpsEnabled = false;
    patch.location = null;
  } else if (data.gpsEnabled === true && !user.location) {
    throw new BadRequestError('Share your location with PUT /user/{userId}/location to enable GPS', 'LOCATION_REQUIRED');
  }

  const updated = await store.users.update(id, patch);
  return serializeUser(updated, updated);
}

/**
 * Deletes a user and everything that belongs to them.
 * @param {number} id User id.
 * @returns {Promise<void>}
 */
export async function deleteUser(id) {
  const store = getStore();
  await getUserOrThrow(id);
  await Promise.all([
    store.reviews.removeWhere({ userId: id }),
    store.texts.removeWhere({ senderId: id }),
    store.texts.removeWhere({ receiverId: id }),
    store.swipes.removeWhere({ fromUserId: id }),
    store.swipes.removeWhere({ toUserId: id }),
    store.matches.removeWhere({ userAId: id }),
    store.matches.removeWhere({ userBId: id }),
    store.notifications.removeWhere({ userId: id })
  ]);
  await store.users.remove(id);
}

/**
 * Changes a user's password.
 * @param {number} id User id.
 * @param {string} password New plain text password.
 * @returns {Promise<void>}
 */
export async function updatePassword(id, password) {
  await getUserOrThrow(id);
  await getStore().users.update(id, { passwordHash: hashPassword(password) });
}

/**
 * Changes a user's e-mail.
 * @param {number} id User id.
 * @param {string} email New e-mail.
 * @returns {Promise<void>}
 * @throws {ConflictError} When another user already uses the e-mail.
 */
export async function updateEmail(id, email) {
  await getUserOrThrow(id);
  const owner = await getStore().users.findOne({ email });
  if (owner && owner.id !== id) throw new ConflictError('This e-mail is already registered', 'EMAIL_EXISTS');
  await getStore().users.update(id, { email });
}

/**
 * Stores the user's GPS location (this means GPS permission was granted).
 * @param {number} id User id.
 * @param {{lat:number,lng:number,label?:string}} location Coordinates.
 * @returns {Promise<object>} Updated own profile.
 */
export async function updateLocation(id, { lat, lng, label }) {
  await getUserOrThrow(id);
  const updated = await getStore().users.update(id, { gpsEnabled: true, location: { lat, lng, label: label ?? null } });
  return serializeUser(updated, updated);
}

/**
 * Lists a user's favorite titles.
 * @param {number} id User id.
 * @returns {Promise<{favorites: object[], shown: object[]}>} All favorites and the ones shown on the profile.
 */
export async function listFavorites(id) {
  const user = await getUserOrThrow(id);
  const titlesById = await loadTitlesById();
  const resolve = (ids) => (ids ?? []).map((titleId) => titlesById.get(titleId)).filter(Boolean);
  return { favorites: resolve(user.favoriteTitleIds), shown: resolve(user.shownFavoriteIds) };
}

/**
 * Adds a title to a user's favorites.
 * @param {number} userId User id.
 * @param {number} titleId Title id.
 * @returns {Promise<{titleId:number, favoriteCount:number}>} Result.
 * @throws {ConflictError} When the title is already a favorite.
 */
export async function addFavorite(userId, titleId) {
  const user = await getUserOrThrow(userId);
  if (!(await getStore().titles.findById(titleId))) throw new NotFoundError('Title not found');
  if (user.favoriteTitleIds.includes(titleId)) throw new ConflictError('This title is already in your favorite list', 'ALREADY_FAVORITE');
  const favoriteTitleIds = [...user.favoriteTitleIds, titleId];
  await getStore().users.update(userId, { favoriteTitleIds });
  return { titleId, favoriteCount: favoriteTitleIds.length };
}

/**
 * Removes a title from a user's favorites (and from the shown ones).
 * @param {number} userId User id.
 * @param {number} titleId Title id.
 * @returns {Promise<{titleId:number, favoriteCount:number}>} Result.
 */
export async function removeFavorite(userId, titleId) {
  const user = await getUserOrThrow(userId);
  if (!user.favoriteTitleIds.includes(titleId)) throw new NotFoundError('Title is not in your favorite list');
  const favoriteTitleIds = user.favoriteTitleIds.filter((id) => id !== titleId);
  const shownFavoriteIds = (user.shownFavoriteIds ?? []).filter((id) => id !== titleId);
  await getStore().users.update(userId, { favoriteTitleIds, shownFavoriteIds });
  return { titleId, favoriteCount: favoriteTitleIds.length };
}

/**
 * Chooses which favorites are displayed on the profile (needs at least 4 favorites, picks exactly 4).
 * @param {number} userId User id.
 * @param {number[]} titleIds The chosen title ids.
 * @returns {Promise<object>} Updated own profile.
 */
export async function setShownFavorites(userId, titleIds) {
  const user = await getUserOrThrow(userId);
  if (user.favoriteTitleIds.length < MIN_FAVORITES_TO_SHOW) {
    throw new ForbiddenError(`You need at least ${MIN_FAVORITES_TO_SHOW} favorites to choose which ones to show`, 'NOT_ENOUGH_FAVORITES');
  }
  const notFavorite = titleIds.filter((id) => !user.favoriteTitleIds.includes(id));
  if (notFavorite.length) throw new BadRequestError(`These titles are not in your favorites: ${notFavorite.join(', ')}`);
  const updated = await getStore().users.update(userId, { shownFavoriteIds: titleIds });
  return serializeUser(updated, updated);
}
