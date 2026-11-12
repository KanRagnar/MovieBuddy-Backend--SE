/**
 * Simple in-memory collection. Mirrors the interface of MongoCollection so the
 * services never need to know which storage is active.
 */
export class MemoryCollection {
  /**
   * @param {object[]} [seed=[]] Initial documents (each needs a numeric `id`).
   */
  constructor(seed = []) {
    this.items = seed.map((item) => structuredClone(item));
    this.nextId = this.items.reduce((max, item) => Math.max(max, item.id), 0) + 1;
  }

  /**
   * Finds documents whose fields equal every entry of `filter`.
   * @param {object} [filter={}] Equality filter.
   * @returns {Promise<object[]>} Matching documents (copies).
   */
  async find(filter = {}) {
    const entries = Object.entries(filter);
    return this.items.filter((item) => entries.every(([key, value]) => item[key] === value)).map((item) => structuredClone(item));
  }

  /**
   * Finds the first document matching `filter`.
   * @param {object} filter Equality filter.
   * @returns {Promise<object|null>} Document or null.
   */
  async findOne(filter) {
    const [first] = await this.find(filter);
    return first ?? null;
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
   * Inserts a document and assigns the next numeric id.
   * @param {object} data Document without `id`.
   * @returns {Promise<object>} Stored document.
   */
  async create(data) {
    const item = { ...structuredClone(data), id: this.nextId++ };
    this.items.push(item);
    return structuredClone(item);
  }

  /**
   * Merges `patch` into the document with the given id.
   * @param {number} id Document id.
   * @param {object} patch Fields to change.
   * @returns {Promise<object|null>} Updated document or null when missing.
   */
  async update(id, patch) {
    const item = this.items.find((entry) => entry.id === id);
    if (!item) return null;
    const { id: _ignored, ...fields } = structuredClone(patch);
    Object.assign(item, fields);
    return structuredClone(item);
  }

  /**
   * Deletes a document by id.
   * @param {number} id Document id.
   * @returns {Promise<boolean>} True when something was deleted.
   */
  async remove(id) {
    const index = this.items.findIndex((entry) => entry.id === id);
    if (index === -1) return false;
    this.items.splice(index, 1);
    return true;
  }

  /**
   * Deletes every document matching `filter`.
   * @param {object} filter Equality filter.
   * @returns {Promise<number>} Number of deleted documents.
   */
  async removeWhere(filter) {
    const entries = Object.entries(filter);
    const before = this.items.length;
    this.items = this.items.filter((item) => !entries.every(([key, value]) => item[key] === value));
    return before - this.items.length;
  }
}

/**
 * Builds the whole in-memory store from seed data.
 * @param {Record<string, object[]>} seed Mock data per collection name.
 * @returns {object} Store with one collection per entity.
 */
export function createMemoryStore(seed) {
  return {
    mode: 'memory',
    users: new MemoryCollection(seed.users),
    titles: new MemoryCollection(seed.titles),
    reviews: new MemoryCollection(seed.reviews),
    texts: new MemoryCollection(seed.texts),
    swipes: new MemoryCollection(seed.swipes),
    matches: new MemoryCollection(seed.matches),
    notifications: new MemoryCollection(seed.notifications)
  };
}
