import * as textService from '../services/textService.js';
import { asyncHandler } from '../utils/helpers.js';
import { sendSuccess } from '../utils/responses.js';

/**
 * POST /text - body: `{ sender, receiver, script, date? }` where sender/receiver are
 * user objects, ids or usernames (`senderId` / `receiverId` are accepted too).
 * The sender defaults to the caller.
 */
export const createText = asyncHandler(async (req, res) => {
  const { sender, senderId, receiver, receiverId, script, date } = req.body;
  const text = await textService.createText(
    { sender: sender ?? senderId ?? req.user?.id, receiver: receiver ?? receiverId, script, date },
    req.user
  );
  sendSuccess(res, text, 'Text created successfully', 201);
});

/** GET /text/:textId */
export const getText = asyncHandler(async (req, res) => {
  sendSuccess(res, await textService.getText(Number(req.params.textId)), 'Text retrieved successfully');
});

/** DELETE /text/:textId */
export const deleteText = asyncHandler(async (req, res) => {
  await textService.deleteText(Number(req.params.textId), req.user);
  sendSuccess(res, null, 'Text deleted successfully');
});

/** GET /user/:senderId/text - texts sent by a user (id or username). */
export const listTextsSentBy = asyncHandler(async (req, res) => {
  sendSuccess(res, await textService.listTextsSentBy(req.params.senderId, req.user), 'Texts retrieved successfully');
});

/** POST /user/:senderId/text - the user in the path sends a text to `receiver`. */
export const createTextForUser = asyncHandler(async (req, res) => {
  const { receiver, receiverId, script, date } = req.body;
  const text = await textService.createText({ sender: req.params.senderId, receiver: receiver ?? receiverId, script, date }, req.user);
  sendSuccess(res, text, 'Text created successfully', 201);
});
