import { getStore } from '../config/database.js';
import { NOTIFICATION_TYPES } from '../config/constants.js';
import { BadRequestError, ForbiddenError, NotFoundError } from '../utils/errors.js';
import { assertOwner, nowISO, todayISO } from '../utils/helpers.js';
import { getMatchBetween, getMatchForUser, otherUserId } from './matchService.js';
import { createNotification } from './notificationService.js';
import { resolveUserRef } from './userService.js';

/**
 * Converts raw texts into the API shape (sender and receiver as small user summaries).
 * @param {object[]} texts Raw texts.
 * @returns {Promise<object[]>} API texts.
 */
async function serializeTexts(texts) {
  const users = await getStore().users.find();
  const summary = new Map(users.map((u) => [u.id, { id: u.id, userId: u.userId, name: u.name }]));
  return texts.map(({ createdAt, ...text }) => ({
    ...text,
    sender: summary.get(text.senderId) ?? null,
    receiver: summary.get(text.receiverId) ?? null,
    createdAt
  }));
}

/**
 * Sends a chat message. Only matched users can chat. The receiver gets a notification.
 * @param {{sender: *, receiver: *, script: string, date?: string}} payload Sender/receiver can be ids, usernames or objects.
 * @param {{id:number}|null} actor The acting user (must be the sender when auth is enforced).
 * @returns {Promise<object>} Created text.
 */
export async function createText({ sender: senderRef, receiver: receiverRef, script, date }, actor) {
  if (senderRef === undefined || senderRef === null) throw new BadRequestError('sender is required');
  if (receiverRef === undefined || receiverRef === null) throw new BadRequestError('receiver is required');

  const sender = await resolveUserRef(senderRef);
  if (!sender) throw new NotFoundError('Sender not found');
  const receiver = await resolveUserRef(receiverRef);
  if (!receiver) throw new NotFoundError('Receiver not found');
  assertOwner(actor, sender.id, 'You can only send messages as yourself');
  if (sender.id === receiver.id) throw new BadRequestError('You cannot send a message to yourself');
  if (!(await getMatchBetween(sender.id, receiver.id))) {
    throw new ForbiddenError('You can only chat with matched profiles', 'NOT_MATCHED');
  }

  const text = await getStore().texts.create({
    senderId: sender.id,
    receiverId: receiver.id,
    script: script.trim(),
    date: date ?? todayISO(),
    createdAt: nowISO()
  });
  await createNotification(receiver.id, NOTIFICATION_TYPES.NEW_MESSAGE, `New message from ${sender.name}`, {
    fromUserId: sender.id,
    textId: text.id
  });
  return (await serializeTexts([text]))[0];
}

/**
 * Gets a text by id.
 * @param {number} id Text id.
 * @returns {Promise<object>} API text.
 */
export async function getText(id) {
  const text = await getStore().texts.findById(id);
  if (!text) throw new NotFoundError('Text not found');
  return (await serializeTexts([text]))[0];
}

/**
 * Deletes a message (only its sender may do so when auth is enforced).
 * @param {number} id Text id.
 * @param {{id:number}|null} actor The acting user.
 * @returns {Promise<void>}
 */
export async function deleteText(id, actor) {
  const text = await getStore().texts.findById(id);
  if (!text) throw new NotFoundError('Text not found');
  assertOwner(actor, text.senderId, 'You can only delete your own messages');
  await getStore().texts.remove(id);
}

/**
 * Lists the texts sent by a user (identified by id or username).
 * @param {string|number} senderRef User reference.
 * @param {{id:number}|null} actor The acting user.
 * @returns {Promise<object[]>} API texts, oldest first.
 */
export async function listTextsSentBy(senderRef, actor) {
  const sender = await resolveUserRef(senderRef);
  if (!sender) throw new NotFoundError('User not found');
  assertOwner(actor, sender.id, 'You can only read your own messages');
  const texts = await getStore().texts.find({ senderId: sender.id });
  return serializeTexts(texts.sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id - b.id));
}

/**
 * Returns the whole conversation of a match, oldest message first.
 * @param {number} userId A participant of the match.
 * @param {number} matchId Match id.
 * @returns {Promise<object[]>} API texts.
 */
export async function getMatchConversation(userId, matchId) {
  const match = await getMatchForUser(userId, matchId);
  const other = otherUserId(match, userId);
  const store = getStore();
  const [sent, received] = await Promise.all([
    store.texts.find({ senderId: userId, receiverId: other }),
    store.texts.find({ senderId: other, receiverId: userId })
  ]);
  const all = [...sent, ...received].sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id - b.id);
  return serializeTexts(all);
}
