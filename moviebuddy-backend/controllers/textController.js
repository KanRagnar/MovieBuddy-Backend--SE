import * as textService from '../services/textService.js';
import { sendSuccess } from '../utils/responses.js';
import { asyncHandler } from '../utils/helpers.js';
import { parseId } from '../utils/validators.js';

/**
 * POST /text - Create a new chat message.
 */
export const createText = asyncHandler(async (req, res) => {
  const created = await textService.createText(req.body);
  return sendSuccess(res, 200, created, 'Text created successfully');
});

/**
 * GET /text/:textId - Get a text message by ID.
 */
export const getTextById = asyncHandler(async (req, res) => {
  const textId = parseId(req.params.textId, 'textId');
  const text = await textService.getTextById(textId);
  return sendSuccess(res, 200, text, 'Text retrieved successfully');
});

/**
 * DELETE /text/:textId - Delete a text message by ID.
 */
export const deleteText = asyncHandler(async (req, res) => {
  const textId = parseId(req.params.textId, 'textId');
  await textService.deleteTextById(textId);
  return sendSuccess(res, 200, { id: textId }, 'Text deleted successfully');
});

/**
 * GET /user/:senderId/text - Get all texts sent/received by a user.
 */
export const getUserTexts = asyncHandler(async (req, res) => {
  const { senderId } = req.params;
  const texts = await textService.getTextsByUser(senderId);
  return sendSuccess(res, 200, texts, 'Texts retrieved successfully');
});

/**
 * POST /user/:senderId/text - Create a new text message for a specific sender.
 */
export const createUserText = asyncHandler(async (req, res) => {
  const { senderId } = req.params;
  const created = await textService.createText({
    ...req.body,
    sender: senderId
  });
  return sendSuccess(res, 200, created, 'Text created successfully');
});
