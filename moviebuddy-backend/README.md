# MovieBuddy API

REST backend for **MovieBuddy**: browse movies/series, review them, keep a favorites list, and swipe/match/chat with other movie lovers nearby. Node.js + Express, ES modules.

It implements the project's OpenAPI spec (`MovieBuddyAPI 1.0.0`) and adds the endpoints required by the user stories (swiping, matches, GPS, notifications, favorites).

## Quick start

```bash
npm install
cp .env.example .env     # optional, defaults work
npm start                # http://localhost:3000
npm test                 # service-layer tests (no server needed)
```

Requires Node.js >= 20.12.

### Storage: mock data or MongoDB

| `MONGODB_URI` | Behaviour |
|---|---|
| empty / not set | Hardcoded mock data in memory (resets on every restart) |
| set | Connects with Mongoose; empty collections are seeded with the same mock data. If the connection fails, the server falls back to the mock data and logs a warning |

`GET /health` shows which storage is active.

### Demo mode vs. secured mode (`REQUIRE_AUTH`)

- `REQUIRE_AUTH=false` (default): no token needed. Requests act as user `DEFAULT_USER_ID` (1 = Nikos), or the user from an `X-User-Id` header. Ownership checks are relaxed so every endpoint can be tried from Postman.
- `REQUIRE_AUTH=true` (R-20): every route except login / register / health needs `Authorization: Bearer <token>`, and users can only edit/read their own resources (profile, reviews, messages, matches, notifications).

Demo users (all with password `password123`): `nikos` (1), `maria` (2), `giorgos` (3), `eleni` (4), `dimitris` (5, hidden profile), `sofia` (6, Athens - too far to be suggested).

## Response format

Every response uses `{ success, data, error, message }`.

```json
{ "success": true,  "data": { "...": "..." }, "error": null, "message": "Title retrieved successfully" }
{ "success": false, "data": null, "error": "NOT_FOUND", "message": "Title not found" }
```

`error` is a machine-readable code (`VALIDATION_ERROR`, `NOT_FOUND`, `CONFLICT`, `GPS_REQUIRED`, `NOT_MATCHED`, ...), `message` is meant for display.

## Endpoints

### Titles (R-2, R-3, R-4, R-6, R-14, R-17)
| Method | Path | Description |
|---|---|---|
| GET | `/title` | List titles. Filter by category: `?genre=Drama,Comedy` |
| GET | `/title/genres` | Categories available for the filter |
| GET | `/title/search?query=&genre=` | Keyword search (message `Sorry! Nothing matches` when empty) |
| GET | `/title/{titleId}` | Details + reviews + `averageRating` + `externalRatings` (IMDb / Rotten Tomatoes sample values) |
| POST | `/title` | Add a title (simulates a TMDB sync); notifies users |
| POST | `/title/{titleId}/AddToFavorites` | Add to the caller's favorites (409 if already there) |
| DELETE | `/title/{titleId}/AddToFavorites` | Remove from favorites |

### Reviews (R-5)
| Method | Path | Description |
|---|---|---|
| POST | `/title/{titleId}/Review` | Caller reviews a title. `rate` 1-10, `comment` max 80 chars, one review per user per title |
| GET | `/title/{titleId}/reviews` | All reviews of a title |
| GET | `/review/{reviewId}` | One review |
| PUT | `/review/{reviewId}` | Edit `rate` / `comment` |
| DELETE | `/review/{reviewId}` | Remove |

### Users & auth (R-1, R-10, R-12, R-20)
| Method | Path | Description |
|---|---|---|
| GET | `/user` | All users (yourself in full, others as public profiles) |
| POST | `/user` | Register (`userId`, `name`, `age`; optional `email`, `password`, profile fields) |
| GET | `/user/{userId}` | One user |
| PUT | `/user/{userId}` | Edit profile (partial). Fields: `name, age, sex, madeIn, job, into, education, images, favoriteMovies, visible, notificationsEnabled, gpsEnabled` |
| DELETE | `/user/{userId}` | Delete account and everything attached to it |
| GET | `/user/login?username=&password=` | Login as in the swagger (**credentials in the URL - prefer POST**) |
| POST | `/user/login` | Same, with a JSON body `{ "username", "password" }`. Returns `token` |
| GET | `/user/logout` | Invalidate the bearer token |
| PUT | `/user/{userId}/password` | `{ "password" }` |
| PUT | `/user/{userId}/email` | `{ "email" }` |
| PUT | `/user/{userId}/location` | `{ "lat", "lng", "label" }` - sharing the location = GPS permission granted |
| GET | `/user/{userId}/favorites` | Favorites and the ones shown on the profile |
| PUT | `/user/{userId}/favorites/shown` | `{ "titleIds": [4 ids] }` (needs >= 4 favorites) |

### Swiping, matches, notifications (R-7, R-8, R-9, R-11, R-12)
| Method | Path | Description |
|---|---|---|
| GET | `/user/{userId}/suggestions[?radiusKm=]` | **One** profile to swipe on (nearest, visible, not swiped, not matched). 403 `GPS_REQUIRED` without location |
| POST | `/user/{userId}/swipe` | `{ "targetId", "direction": "left"\|"right" }`. Mutual right swipes create a match and notify both users. Returns `matched`, `match`, `nextProfile` |
| GET | `/user/{userId}/matches` | Matches with the other profile and last message |
| GET | `/user/{userId}/matches/{matchId}/texts` | Chat of a match |
| DELETE | `/user/{userId}/matches/{matchId}` | Unmatch and delete the chat |
| GET | `/user/{userId}/notifications[?unread=true]` | New title / new match / new message notifications (only created when the user has them enabled) |
| PUT | `/user/{userId}/notifications/{notificationId}/read` | Mark as read |

### Texts / chat (R-9)
| Method | Path | Description |
|---|---|---|
| POST | `/text` | `{ sender, receiver, script, date? }` (sender/receiver = user object, id or username). Only matched users can chat (403 `NOT_MATCHED`) |
| GET | `/text/{textId}` | One text |
| DELETE | `/text/{textId}` | Delete a message |
| GET | `/user/{senderId}/text` | Texts sent by a user (id or username) |
| POST | `/user/{senderId}/text` | `{ receiver, script, date? }` |

### Misc
`GET /` API info, `GET /health` status and storage mode.

## Deviations from the swagger (on purpose)

- `GET /title` returns the **list** of titles (the swagger describes a single `Title`), so the home page and category filter work.
- Passwords are accepted on registration (not in the swagger `User` schema) and stored only as scrypt hashes; they are never returned.
- `favoriteMovies` accepts title ids or title objects; responses return full title objects.
- Posters/images are URL strings instead of binary data.
- Reviews also carry `userId`, texts also carry `senderId` / `receiverId`.
- The `GET /user/login` credentials-in-URL design from the swagger is kept for compatibility; `POST /user/login` is the safer alternative.

## Project structure

```
server.js / app.js        entry points
config/                   constants.js (env + rules), database.js (Mongo or memory)
models/                   Mongoose schemas, mockData.js, memoryStore.js, mongoStore.js
routes/                   one router per resource, all mounted in routes/index.js
controllers/              thin HTTP layer
services/                 business logic
middleware/               auth, validation, errorHandler, logger, cors
utils/                    responses, validators, helpers, errors
test/                     node:test suite for the business logic
```

## Known limitations

- Sessions (tokens) live in memory and are lost on restart.
- Ids in MongoDB mode are `max(id)+1`, fine for a course project but not for heavy concurrent writes.
- Notifications are stored and served via the API (polling); there is no push/WebSocket delivery.
- TMDB / IMDb / Rotten Tomatoes are not called; titles and external ratings are mock data.
