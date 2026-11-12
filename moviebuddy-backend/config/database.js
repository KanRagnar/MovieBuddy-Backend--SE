import { createMemoryStore } from '../models/memoryStore.js';
import { buildMockData } from '../models/mockData.js';
import { config } from './constants.js';

let store = null;
let mongooseInstance = null;

/**
 * Initialises the data store. Uses MongoDB when MONGODB_URI is set (and
 * reachable), otherwise falls back to the hardcoded in-memory mock data.
 * @returns {Promise<'mongodb'|'memory'>} The active storage mode.
 */
export async function connectDatabase() {
  const seed = buildMockData();

  if (config.mongoUri) {
    try {
      const { default: mongoose } = await import('mongoose');
      await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 5000 });
      const { createMongoStore } = await import('../models/mongoStore.js');
      store = await createMongoStore(mongoose, seed);
      mongooseInstance = mongoose;
      console.log('Connected to MongoDB - data is persistent.');
      return store.mode;
    } catch (error) {
      console.warn(`Could not use MongoDB (${error.message}). Falling back to in-memory mock data.`);
    }
  } else {
    console.log('MONGODB_URI not set - using in-memory mock data (resets on every restart).');
  }

  store = createMemoryStore(seed);
  return store.mode;
}

/**
 * Returns the active data store. Call connectDatabase() first.
 * @returns {object} Store with the collections users, titles, reviews, texts, swipes, matches, notifications.
 * @throws {Error} When the database has not been initialised.
 */
export function getStore() {
  if (!store) throw new Error('Database not initialised. Call connectDatabase() first.');
  return store;
}

/**
 * Tells which storage is active.
 * @returns {'mongodb'|'memory'|'uninitialised'} Storage mode.
 */
export function getDatabaseMode() {
  return store?.mode ?? 'uninitialised';
}

/**
 * Closes the MongoDB connection (no-op in memory mode).
 * @returns {Promise<void>}
 */
export async function disconnectDatabase() {
  if (mongooseInstance) await mongooseInstance.disconnect();
}
