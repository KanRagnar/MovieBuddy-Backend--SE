import { getStore } from '../config/database.js';
import { NOTIFICATION_TYPES } from '../config/constants.js';
import { NotFoundError } from '../utils/errors.js';
import { nowISO } from '../utils/helpers.js';

/**
 * Creates a notification for a user, but only if the user has notifications enabled.
 * @param {number} userId Recipient id.
 * @param {string} type One of NOTIFICATION_TYPES.
 * @param {string} message Text shown in the pop-up.
 * @param {object} [data={}] Extra details (title, release date, location, ids...).
 * @returns {Promise<object|null>} Created notification, or null when notifications are disabled.
 */
export async function createNotification(userId, type, message, data = {}) {
  const store = getStore();
  const user = await store.users.findById(userId);
  if (!user || !user.notificationsEnabled) return null;
  return store.notifications.create({ userId, type, message, data, read: false, createdAt: nowISO() });
}

/**
 * Notifies every user (with notifications enabled) about a newly added title.
 * @param {object} title The new title.
 * @returns {Promise<number>} Number of notifications created.
 */
export async function notifyNewTitle(title) {
  const users = await getStore().users.find();
  let created = 0;
  // Sequential on purpose: ids are generated one after another.
  for (const user of users) {
    const notification = await createNotification(user.id, NOTIFICATION_TYPES.NEW_TITLE, `New title: ${title.title}`, {
      titleId: title.id,
      title: title.title,
      releaseDate: title.releaseDate ?? null,
      location: user.location?.label ?? null
    });
    if (notification) created += 1;
  }
  return created;
}

/**
 * Lists a user's notifications, newest first.
 * @param {number} userId Owner id.
 * @param {{unreadOnly?: boolean}} [options] Filter options.
 * @returns {Promise<object[]>} Notifications.
 */
export async function listNotifications(userId, { unreadOnly = false } = {}) {
  const user = await getStore().users.findById(userId);
  if (!user) throw new NotFoundError('User not found');
  const all = await getStore().notifications.find({ userId });
  return all.filter((n) => !unreadOnly || !n.read).sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id - a.id);
}

/**
 * Marks one notification as read.
 * @param {number} userId Owner id.
 * @param {number} notificationId Notification id.
 * @returns {Promise<object>} Updated notification.
 */
export async function markNotificationRead(userId, notificationId) {
  const notification = await getStore().notifications.findById(notificationId);
  if (!notification || notification.userId !== userId) throw new NotFoundError('Notification not found');
  return getStore().notifications.update(notificationId, { read: true });
}
