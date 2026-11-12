import { createMatchModel } from './Match.js';
import { createNotificationModel } from './Notification.js';
import { createReviewModel } from './Review.js';
import { createSwipeModel } from './Swipe.js';
import { createTextModel } from './Text.js';
import { createTitleModel } from './Title.js';
import { createUserModel } from './User.js';

/**
 * MongoDB-backed collection with the same interface as MemoryCollection.
 * Documents keep a numeric `id` (separate from Mongo's `_id`) to match the swagger.
 */
export class MongoCollection {
  /**
   * @param {import('mongoose').Model} model Mongoose model.
   */
  constructor(model) {
    this.model = model;
  }

  /**
   * Removes Mongo internals from a lean document.
   * @param {object|null} doc Lean document.
   * @returns {object|null} Plain document.
   */
  static clean(doc) {
    if (!doc) return null;
    const { _id, __v, ...rest } = doc;
    return rest;
  }

  /**
   * Finds documents matching an equality filter.
   * @param {object} [filter={}] Equality filter.
   * @returns {Promise<object[]>} Documents sorted by id.
   */
  async find(filter = {}) {
    const docs = await this.model.find(filter).sort({ id: 1 }).lean();
    return docs.map(MongoCollection.clean);
  }

  /**
   * Finds the first document matching `filter`.
   * @param {object} filter Equality filter.
   * @returns {Promise<object|null>} Document or null.
   */
  async findOne(filter) {
    return MongoCollection.clean(await this.model.findOne(filter).lean());
  }

  /**
   * Finds a document by numeric id.
   * @param {number} id Document id.
   * @returns {Promise<object|null>} Document or null.
   */
  async findById(id) {
    return this.findOne({ id });
  }

  /**
   * Inserts a document using the next numeric id.
   * @param {object} data Document without `id`.
   * @returns {Promise<object>} Stored document.
   */
  async create(data) {
    const last = await this.model.findOne().sort({ id: -1 }).select('id').lean();
    const doc = await this.model.create({ ...data, id: (last?.id ?? 0) + 1 });
    return MongoCollection.clean(doc.toObject());
  }

  /**
   * Merges `patch` into the document with the given id.
   * @param {number} id Document id.
   * @param {object} patch Fields to change.
   * @returns {Promise<object|null>} Updated document or null.
   */
  async update(id, patch) {
    const { id: _ignored, ...fields } = patch;
    const doc = await this.model.findOneAndUpdate({ id }, { $set: fields }, { new: true, runValidators: true }).lean();
    return MongoCollection.clean(doc);
  }

  /**
   * Deletes a document by id.
   * @param {number} id Document id.
   * @returns {Promise<boolean>} True when something was deleted.
   */
  async remove(id) {
    const result = await this.model.deleteOne({ id });
    return result.deletedCount > 0;
  }

  /**
   * Deletes every document matching `filter`.
   * @param {object} filter Equality filter.
   * @returns {Promise<number>} Number of deleted documents.
   */
  async removeWhere(filter) {
    const result = await this.model.deleteMany(filter);
    return result.deletedCount;
  }
}

/**
 * Builds the MongoDB store and seeds every empty collection with the mock data.
 * @param {import('mongoose').Mongoose} mongoose Connected mongoose instance.
 * @param {Record<string, object[]>} seed Mock data per collection name.
 * @returns {Promise<object>} Store with one collection per entity.
 */
export async function createMongoStore(mongoose, seed) {
  const models = {
    users: createUserModel(mongoose),
    titles: createTitleModel(mongoose),
    reviews: createReviewModel(mongoose),
    texts: createTextModel(mongoose),
    swipes: createSwipeModel(mongoose),
    matches: createMatchModel(mongoose),
    notifications: createNotificationModel(mongoose)
  };

  for (const [name, model] of Object.entries(models)) {
    await model.init();
    if ((await model.estimatedDocumentCount()) === 0 && seed[name]?.length) {
      await model.insertMany(seed[name]);
    }
  }

  return {
    mode: 'mongodb',
    ...Object.fromEntries(Object.entries(models).map(([name, model]) => [name, new MongoCollection(model)]))
  };
}
