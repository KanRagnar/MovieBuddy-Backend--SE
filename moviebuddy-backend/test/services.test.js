import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { connectDatabase, getStore } from '../config/database.js';
import * as authService from '../services/authService.js';
import * as notificationService from '../services/notificationService.js';
import * as reviewService from '../services/reviewService.js';
import * as socialService from '../services/socialService.js';
import * as textService from '../services/textService.js';
import * as titleService from '../services/titleService.js';
import * as userService from '../services/userService.js';
import { DEMO_PASSWORD } from '../models/mockData.js';
import { errorHandler } from '../middleware/errorHandler.js';
import { validateReviewPayload, validateSwipePayload, validateUserPayload } from '../utils/validators.js';

const rejectsWith = (promise, code) => assert.rejects(promise, (err) => err.code === code || err.statusCode === code);

before(async () => {
  delete process.env.MONGODB_URI;
  assert.equal(await connectDatabase(), 'memory');
});

describe('titles', () => {
  it('lists, filters by genre and searches by keywords', async () => {
    assert.equal((await titleService.listTitles()).length, 12);
    const sciFi = await titleService.listTitles({ genre: 'sci-fi' });
    assert.deepEqual(sciFi.map((t) => t.genre), ['Sci-Fi', 'Sci-Fi', 'Sci-Fi']);
    assert.equal((await titleService.listTitles({ genre: 'Drama,Comedy' })).length, 4);
    assert.equal((await titleService.searchTitles({ query: 'dream thief' }))[0].title, 'Inception');
    assert.deepEqual(await titleService.searchTitles({ query: 'zzzzzz' }), []);
  });

  it('returns details with reviews and 404 for unknown ids', async () => {
    const details = await titleService.getTitleById(1);
    assert.equal(details.reviews.length, 2);
    assert.equal(details.averageRating, 8.5);
    await rejectsWith(titleService.getTitleById(999), 404);
  });
});

describe('users, auth and favorites', () => {
  it('logs in with the demo password and rejects wrong credentials', async () => {
    const session = await authService.login('nikos', DEMO_PASSWORD);
    assert.equal(session.user.userId, 'nikos');
    assert.equal(session.user.passwordHash, undefined);
    assert.equal((await authService.getUserFromToken(session.token)).id, 1);
    assert.ok(authService.logout(session.token));
    assert.equal(await authService.getUserFromToken(session.token), null);
    await rejectsWith(authService.login('nikos', 'wrong'), 401);
    await rejectsWith(authService.login('nobody', 'x'), 401);
  });

  it('registers, updates and deletes a user; others only see a public profile', async () => {
    const created = await userService.createUser({ userId: 'anna', name: 'Anna', age: 29, email: 'anna@example.com', password: 'secret123', favoriteMovies: [1, { id: 2 }] });
    assert.equal(created.favoriteMovies.length, 2);
    assert.equal(created.passwordHash, undefined);
    await rejectsWith(userService.createUser({ userId: 'anna', name: 'Dup', age: 30 }), 409);
    await rejectsWith(userService.createUser({ userId: 'bad1', name: 'X', age: 30, favoriteMovies: [999] }), 400);

    const updated = await userService.updateUser(created.id, { job: 'Doctor', visible: false });
    assert.equal(updated.job, 'Doctor');
    assert.equal(updated.visible, false);

    const [asOther] = await userService.serializeUsers([await userService.getUserOrThrow(created.id)], { id: 1 });
    assert.equal(asOther.email, undefined);

    await userService.deleteUser(created.id);
    await rejectsWith(userService.getUserOrThrow(created.id), 404);
  });

  it('manages favorites (duplicates, removal, choosing 4 to show)', async () => {
    await rejectsWith(userService.addFavorite(1, 5), 409); // already a favorite
    await userService.removeFavorite(1, 10);
    await userService.addFavorite(1, 10);
    assert.equal((await userService.listFavorites(1)).favorites.length, 5);
    const updated = await userService.setShownFavorites(1, [1, 3, 5, 10]);
    assert.deepEqual(updated.shownFavoriteMovies.map((t) => t.id), [1, 3, 5, 10]);
    await rejectsWith(userService.setShownFavorites(1, [1, 3, 5, 12]), 400);
    await rejectsWith(userService.setShownFavorites(5, [1, 2, 3, 4]), 403); // only 2 favorites
    await rejectsWith(userService.addFavorite(1, 999), 404);
  });
});

describe('reviews', () => {
  it('creates, edits and deletes a review; enforces one review per title', async () => {
    const review = await reviewService.createReview(2, { id: 1 }, { rate: 8, comment: 'Classic.' });
    assert.equal(review.userId, 1);
    await rejectsWith(reviewService.createReview(2, { id: 1 }, { rate: 5, comment: 'Again' }), 409);
    const edited = await reviewService.updateReview(review.id, { id: 1 }, { rate: 10 });
    assert.equal(edited.rate, 10);
    assert.equal(edited.comment, 'Classic.');
    await reviewService.deleteReview(review.id, { id: 1 });
    await rejectsWith(reviewService.getReview(review.id), 404);
    await rejectsWith(reviewService.createReview(999, { id: 1 }, { rate: 5, comment: 'x' }), 404);
  });

  it('validates rate (1-10) and comment length (80)', () => {
    assert.equal(validateReviewPayload({ rate: 7, comment: 'ok' }).length, 0);
    assert.equal(validateReviewPayload({ rate: 11, comment: 'ok' }).length, 1);
    assert.equal(validateReviewPayload({ rate: 5, comment: 'x'.repeat(81) }).length, 1);
    assert.equal(validateReviewPayload({}).length, 2);
    assert.equal(validateReviewPayload({}, { partial: true }).length, 0);
  });
});

describe('swiping, matches and chat', () => {
  it('suggests exactly one nearby, visible, not-yet-swiped profile', async () => {
    const profile = await socialService.getNextProfile(1);
    assert.ok([2, 4].includes(profile.id)); // 5 is hidden, 6 is too far, 3 is matched
    assert.equal(profile.email, undefined);
    assert.ok(profile.distanceKm >= 0);
  });

  it('requires GPS for swiping', async () => {
    await userService.updateUser(4, { gpsEnabled: false });
    await rejectsWith(socialService.getNextProfile(4), 'GPS_REQUIRED');
    await userService.updateLocation(4, { lat: 40.67, lng: 22.91, label: 'Thessaloniki' });
    assert.ok(await socialService.getNextProfile(4));
  });

  it('matches on mutual right swipes, notifies both, allows chat and unmatch', async () => {
    const left = await socialService.swipe(1, { targetId: 4, direction: 'left' });
    assert.equal(left.matched, false);
    await rejectsWith(socialService.swipe(1, { targetId: 4, direction: 'right' }), 409);

    const result = await socialService.swipe(1, { targetId: 2, direction: 'right' }); // Maria already liked Nikos
    assert.equal(result.matched, true);
    assert.equal(result.match.profile.name, 'Maria');
    assert.equal(result.nextProfile, null);
    const mariaNotes = await notificationService.listNotifications(2);
    assert.equal(mariaNotes[0].type, 'new_match');

    const text = await textService.createText({ sender: 'nikos', receiver: { id: 2 }, script: 'Hi Maria!' }, null);
    assert.equal(text.sender.name, 'Nikos');
    assert.equal((await notificationService.listNotifications(2))[0].type, 'new_message');
    assert.equal((await textService.getMatchConversation(1, result.match.matchId)).length, 1);
    assert.equal((await textService.listTextsSentBy('nikos', null)).length >= 2, true);

    await rejectsWith(textService.createText({ sender: 1, receiver: 6, script: 'hey' }, null), 'NOT_MATCHED');
    const removed = await socialService.unmatch(2, result.match.matchId);
    assert.equal(removed.deletedTexts, 1);
    await rejectsWith(textService.getMatchConversation(1, result.match.matchId), 404);
    await rejectsWith(textService.createText({ sender: 1, receiver: 2, script: 'still there?' }, null), 'NOT_MATCHED');
  });
});

describe('notifications', () => {
  it('notifies only users with notifications enabled about new titles', async () => {
    await userService.updateUser(6, { notificationsEnabled: false });
    const { notificationsSent, title } = await titleService.createTitle({ title: 'Dune: Part Two', description: 'Paul unites with the Fremen.', releaseDate: '2024-02-29', genre: 'Sci-Fi', duration: 166 });
    assert.equal(notificationsSent, 5);
    assert.equal((await notificationService.listNotifications(6)).length, 0);
    const [note] = await notificationService.listNotifications(1);
    assert.equal(note.data.title, 'Dune: Part Two');
    assert.equal(note.data.location, 'Thessaloniki');
    assert.equal(title.id, 13);
    const read = await notificationService.markNotificationRead(1, note.id);
    assert.equal(read.read, true);
    await rejectsWith(notificationService.markNotificationRead(2, note.id), 404);
  });
});

describe('validators and error handler', () => {
  it('validates user and swipe payloads', () => {
    assert.equal(validateUserPayload({ userId: 'ab', name: '', age: 10 }).length, 3);
    assert.equal(validateUserPayload({ userId: 'valid_user', name: 'A', age: 30 }).length, 0);
    assert.equal(validateSwipePayload({ targetId: 2, direction: 'up' }).length, 1);
  });

  it('maps different error types to the {success,data,error,message} envelope', () => {
    const run = (err) => {
      let captured;
      const res = { headersSent: false, status(code) { captured = { code }; return this; }, json(body) { captured.body = body; } };
      errorHandler(err, {}, res, () => {});
      return captured;
    };
    const notFound = run(Object.assign(new Error('x'), { statusCode: 404 }));
    assert.equal(notFound.code, 500); // plain errors are never trusted as HTTP statuses
    const parse = run(Object.assign(new SyntaxError('bad'), { type: 'entity.parse.failed' }));
    assert.deepEqual([parse.code, parse.body.success, parse.body.error], [400, false, 'INVALID_JSON']);
    assert.ok(getStore());
  });
});
