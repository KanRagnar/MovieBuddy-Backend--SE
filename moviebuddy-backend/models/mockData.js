import { hashPassword } from '../utils/helpers.js';

/** Password shared by every demo user. */
export const DEMO_PASSWORD = 'password123';

const poster = (text) => `https://placehold.co/300x450?text=${encodeURIComponent(text)}`;
const photo = (name, n) => `https://placehold.co/600x800?text=${encodeURIComponent(`${name} ${n}`)}`;

/**
 * Builds the hardcoded mock data used when no MongoDB is configured
 * (and to seed an empty MongoDB). Returns fresh objects on every call.
 * Note: the IMDb / Rotten Tomatoes ratings are sample values, not live data.
 * @returns {Record<string, object[]>} Mock data per collection.
 */
export function buildMockData() {
  const passwordHash = hashPassword(DEMO_PASSWORD);

  const titles = [
    { id: 1, title: 'Inception', description: 'A thief who steals secrets through dream-sharing technology is given the task of planting an idea in a target\'s mind.', releaseDate: '2010-07-16', duration: 148, genre: 'Sci-Fi', externalRatings: { imdb: 8.8, rottenTomatoes: 87 } },
    { id: 2, title: 'The Godfather', description: 'The aging patriarch of an organized crime dynasty transfers control of his empire to his reluctant son.', releaseDate: '1972-03-24', duration: 175, genre: 'Crime', externalRatings: { imdb: 9.2, rottenTomatoes: 97 } },
    { id: 3, title: 'Breaking Bad', description: 'A high school chemistry teacher diagnosed with cancer turns to manufacturing drugs to secure his family\'s future.', releaseDate: '2008-01-20', numOfSeasons: 5, numOfEpisodes: 62, genre: 'Drama', externalRatings: { imdb: 9.5, rottenTomatoes: 96 } },
    { id: 4, title: 'Stranger Things', description: 'When a boy vanishes, a small town uncovers a mystery involving secret experiments and supernatural forces.', releaseDate: '2016-07-15', numOfSeasons: 4, numOfEpisodes: 34, genre: 'Sci-Fi', externalRatings: { imdb: 8.7, rottenTomatoes: 92 } },
    { id: 5, title: 'The Shawshank Redemption', description: 'Two imprisoned men bond over the years, finding solace and eventual redemption through acts of common decency.', releaseDate: '1994-09-23', duration: 142, genre: 'Drama', externalRatings: { imdb: 9.3, rottenTomatoes: 89 } },
    { id: 6, title: 'Pulp Fiction', description: 'The lives of two hitmen, a boxer and a pair of diner bandits intertwine in four tales of violence and redemption.', releaseDate: '1994-10-14', duration: 154, genre: 'Crime', externalRatings: { imdb: 8.9, rottenTomatoes: 92 } },
    { id: 7, title: 'Spirited Away', description: 'A sullen girl wanders into a world ruled by gods, witches and spirits, where humans are changed into beasts.', releaseDate: '2001-07-20', duration: 125, genre: 'Animation', externalRatings: { imdb: 8.6, rottenTomatoes: 96 } },
    { id: 8, title: 'The Office', description: 'A mockumentary on a group of typical office workers, where the workday consists of ego clashes and inappropriate behavior.', releaseDate: '2005-03-24', numOfSeasons: 9, numOfEpisodes: 201, genre: 'Comedy', externalRatings: { imdb: 9.0, rottenTomatoes: 81 } },
    { id: 9, title: 'Interstellar', description: 'A team of explorers travels through a wormhole in space in an attempt to ensure humanity\'s survival.', releaseDate: '2014-11-07', duration: 169, genre: 'Sci-Fi', externalRatings: { imdb: 8.7, rottenTomatoes: 73 } },
    { id: 10, title: 'Parasite', description: 'Greed and class discrimination threaten the newly formed symbiotic relationship between a wealthy family and a destitute clan.', releaseDate: '2019-05-30', duration: 132, genre: 'Thriller', externalRatings: { imdb: 8.5, rottenTomatoes: 99 } },
    { id: 11, title: 'The Grand Budapest Hotel', description: 'The adventures of a legendary concierge at a famous European hotel and the lobby boy who becomes his trusted protege.', releaseDate: '2014-03-28', duration: 99, genre: 'Comedy', externalRatings: { imdb: 8.1, rottenTomatoes: 92 } },
    { id: 12, title: 'Mad Max: Fury Road', description: 'In a post-apocalyptic wasteland, a woman rebels against a tyrannical ruler in search of her homeland.', releaseDate: '2015-05-15', duration: 120, genre: 'Action', externalRatings: { imdb: 8.1, rottenTomatoes: 97 } }
  ].map((t) => ({ numOfSeasons: null, numOfEpisodes: null, duration: null, ...t, poster: poster(t.title) }));

  const baseUser = { passwordHash, notificationsEnabled: true, visible: true, gpsEnabled: true, createdAt: '2026-10-01T09:00:00.000Z' };
  const users = [
    { ...baseUser, id: 1, userId: 'nikos', name: 'Nikos', age: 24, email: 'nikos@example.com', sex: 'male', madeIn: 'Greece', job: 'Software Engineer', into: 'Sci-Fi, Hiking', education: 'BSc Electrical & Computer Engineering', images: [photo('Nikos', 1), photo('Nikos', 2)], favoriteTitleIds: [1, 3, 5, 9, 10], shownFavoriteIds: [1, 3, 5, 9], location: { lat: 40.6401, lng: 22.9444, label: 'Thessaloniki' } },
    { ...baseUser, id: 2, userId: 'maria', name: 'Maria', age: 23, email: 'maria@example.com', sex: 'female', madeIn: 'Greece', job: 'Graphic Designer', into: 'Animation, Photography', education: 'BA Graphic Design', images: [photo('Maria', 1), photo('Maria', 2), photo('Maria', 3)], favoriteTitleIds: [7, 10, 11, 2], shownFavoriteIds: [7, 10, 11, 2], location: { lat: 40.6264, lng: 22.9484, label: 'Thessaloniki' } },
    { ...baseUser, id: 3, userId: 'giorgos', name: 'Giorgos', age: 26, email: 'giorgos@example.com', sex: 'male', madeIn: 'Greece', job: 'Photographer', into: 'Crime films, Travel', education: 'Diploma in Photography', images: [photo('Giorgos', 1)], favoriteTitleIds: [2, 6, 3, 12, 4], shownFavoriteIds: [2, 6, 3, 12], location: { lat: 40.5826, lng: 22.9505, label: 'Kalamaria' } },
    { ...baseUser, id: 4, userId: 'eleni', name: 'Eleni', age: 25, email: 'eleni@example.com', sex: 'female', madeIn: 'Cyprus', job: 'Teacher', into: 'Comedy, Books', education: 'MSc Education', images: [photo('Eleni', 1), photo('Eleni', 2)], favoriteTitleIds: [8, 11, 4, 9], shownFavoriteIds: [8, 11, 4, 9], location: { lat: 40.67, lng: 22.91, label: 'Thessaloniki' } },
    { ...baseUser, id: 5, userId: 'dimitris', name: 'Dimitris', age: 28, email: 'dimitris@example.com', sex: 'male', madeIn: 'Greece', job: 'Chef', into: 'Action, Cooking', education: 'Culinary School', images: [photo('Dimitris', 1)], favoriteTitleIds: [12, 6], shownFavoriteIds: [], visible: false, location: { lat: 40.63, lng: 22.95, label: 'Thessaloniki' } },
    { ...baseUser, id: 6, userId: 'sofia', name: 'Sofia', age: 27, email: 'sofia@example.com', sex: 'female', madeIn: 'Greece', job: 'Architect', into: 'Thrillers, Design', education: 'MSc Architecture', images: [photo('Sofia', 1)], favoriteTitleIds: [10, 5, 9], shownFavoriteIds: [], location: { lat: 37.9838, lng: 23.7275, label: 'Athens' } }
  ];

  const reviews = [
    { id: 1, titleId: 1, userId: 1, rate: 9, comment: 'Mind-bending masterpiece.', date: '2026-10-05', updatedAt: null },
    { id: 2, titleId: 1, userId: 3, rate: 8, comment: 'Great visuals and score.', date: '2026-10-07', updatedAt: null },
    { id: 3, titleId: 3, userId: 1, rate: 10, comment: 'Best series ever made.', date: '2026-10-10', updatedAt: null },
    { id: 4, titleId: 7, userId: 2, rate: 9, comment: 'Pure magic, a must watch.', date: '2026-10-12', updatedAt: null },
    { id: 5, titleId: 2, userId: 3, rate: 10, comment: 'An offer you cannot refuse.', date: '2026-10-15', updatedAt: null }
  ];

  // Nikos <-> Giorgos are already matched; Maria has liked Nikos but he has not answered yet.
  const swipes = [
    { id: 1, fromUserId: 1, toUserId: 3, direction: 'right', createdAt: '2026-11-01T10:00:00.000Z' },
    { id: 2, fromUserId: 3, toUserId: 1, direction: 'right', createdAt: '2026-11-01T10:05:00.000Z' },
    { id: 3, fromUserId: 2, toUserId: 1, direction: 'right', createdAt: '2026-11-02T18:30:00.000Z' },
    { id: 4, fromUserId: 4, toUserId: 1, direction: 'left', createdAt: '2026-11-03T12:00:00.000Z' }
  ];

  const matches = [{ id: 1, userAId: 1, userBId: 3, createdAt: '2026-11-01T10:05:00.000Z' }];

  const texts = [
    { id: 1, senderId: 1, receiverId: 3, script: 'Hey! Saw you love The Godfather too.', date: '2026-11-01', createdAt: '2026-11-01T10:10:00.000Z' },
    { id: 2, senderId: 3, receiverId: 1, script: 'Of course! Best movie ever. Have you seen Pulp Fiction?', date: '2026-11-01', createdAt: '2026-11-01T10:12:00.000Z' },
    { id: 3, senderId: 1, receiverId: 3, script: 'Many times. Movie night this weekend?', date: '2026-11-01', createdAt: '2026-11-01T10:15:00.000Z' }
  ];

  const notifications = [
    { id: 1, userId: 1, type: 'new_match', message: 'You matched with Giorgos!', data: { matchId: 1, profileId: 3, name: 'Giorgos', location: 'Thessaloniki' }, read: true, createdAt: '2026-11-01T10:05:00.000Z' },
    { id: 2, userId: 1, type: 'new_message', message: 'New message from Giorgos', data: { fromUserId: 3, textId: 2 }, read: false, createdAt: '2026-11-01T10:12:00.000Z' }
  ];

  return { users, titles, reviews, texts, swipes, matches, notifications };
}
