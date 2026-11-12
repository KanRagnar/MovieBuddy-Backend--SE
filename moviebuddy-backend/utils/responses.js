/**
 * Sends a successful response using the standard envelope
 * `{ success, data, error, message }`.
 * @param {import('express').Response} res Express response.
 * @param {*} [data=null] Payload.
 * @param {string} [message='Operation successful'] Human readable message.
 * @param {number} [statusCode=200] HTTP status code.
 * @returns {import('express').Response} The response.
 */
export function sendSuccess(res, data = null, message = 'Operation successful', statusCode = 200) {
  return res.status(statusCode).json({ success: true, data, error: null, message });
}

/**
 * Sends an error response using the standard envelope.
 * `error` is a machine readable code, `message` is meant for display.
 * @param {import('express').Response} res Express response.
 * @param {number} statusCode HTTP status code.
 * @param {string} error Machine readable error code.
 * @param {string} message Human readable message.
 * @returns {import('express').Response} The response.
 */
export function sendError(res, statusCode, error, message) {
  return res.status(statusCode).json({ success: false, data: null, error, message });
}
