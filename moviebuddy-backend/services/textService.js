import Text from '../models/Text.js';
import User from '../models/User.js';
import { mockTexts, mockUsers } from '../config/constants.js';
import { getDbStatus } from '../config/database.js';
import { AppError } from '../utils/validators.js';
import { getNextId } from '../utils/helpers.js';

const textsStore = [...mockTexts];

/**
 * Creates a new chat message between sender and receiver.
 * @param {Object} textData - { sender, receiver, script, date }.
 * @returns {Promise<Object>} Created text message.
 */
export const createText = async (textData) => {
  const senderId = typeof textData.sender === 'object' ? textData.sender.userId : textData.sender;
  const receiverId = typeof textData.receiver === 'object' ? textData.receiver.userId : textData.receiver;

  if (!senderId || !receiverId) {
    throw new AppError('Both sender and receiver are required', 400);
  }

  const dateStr = textData.date || new Date().toISOString().split('T')[0];

  if (getDbStatus()) {
    const all = await Text.find().lean();
    const created = await Text.create({
      id: getNextId(all),
      sender: senderId,
      receiver: receiverId,
      script: textData.script.trim(),
      date: dateStr
    });
    return created.toObject();
  }

  const newText = {
    id: getNextId(textsStore),
    sender: senderId,
    receiver: receiverId,
    script: textData.script.trim(),
    date: dateStr
  };
  textsStore.push(newText);
  return newText;
};

/**
 * Retrieves a single text message by numeric ID.
 * @param {number} textId - Message ID.
 * @returns {Promise<Object>} Text message object.
 */
export const getTextById = async (textId) => {
  let text;
  if (getDbStatus()) {
    text = await Text.findOne({ id: textId }).lean();
  } else {
    text = textsStore.find((t) => t.id === textId);
  }
  if (!text) {
    throw new AppError(`Text with ID ${textId} not found`, 404);
  }
  return text;
};

/**
 * Deletes a text message by numeric ID.
 * @param {number} textId - Message ID.
 * @returns {Promise<boolean>} True if deleted.
 */
export const deleteTextById = async (textId) => {
  if (getDbStatus()) {
    const deleted = await Text.findOneAndDelete({ id: textId });
    if (!deleted) throw new AppError(`Text with ID ${textId} not found`, 404);
    return true;
  }

  const index = textsStore.findIndex((t) => t.id === textId);
  if (index === -1) {
    throw new AppError(`Text with ID ${textId} not found`, 404);
  }
  textsStore.splice(index, 1);
  return true;
};

/**
 * Retrieves all texts sent or received by a specific user (by userId string).
 * @param {string} senderId - User's string userId (e.g., 'sampleuser').
 * @returns {Promise<Array<Object>>} List of messages.
 */
export const getTextsByUser = async (senderId) => {
  if (getDbStatus()) {
    const userExists = await User.findOne({ userId: senderId }).lean();
    if (!userExists) throw new AppError(`User '${senderId}' not found`, 404);
    return await Text.find({
      $or: [{ sender: senderId }, { receiver: senderId }]
    }).lean();
  }

  const userExists = mockUsers.some((u) => u.userId === senderId);
  if (!userExists) {
    throw new AppError(`User '${senderId}' not found`, 404);
  }

  return textsStore.filter((t) => t.sender === senderId || t.receiver === senderId);
};
