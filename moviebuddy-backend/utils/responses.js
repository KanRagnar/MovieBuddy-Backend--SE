/**
 * Sends a standardized success JSON response.
 * @param {import('express').Response} res - Express response object.
 * @param {number} statusCode - HTTP status code.
 * @param {any} data - Payload data.
 * @param {string} message - Human-readable status message.
 * @returns {import('express').Response}
 */
export const sendSuccess = (res, statusCode = 200, data = null, message = 'Operation successful') => {
  return res.status(statusCode).json({
    success: true,
    data,
    error: null,
    message
  });
};

/**
 * Sends a standardized error JSON response.
 * @param {import('express').Response} res - Express response object.
 * @param {number} statusCode - HTTP status code.
 * @param {string} errorMessage - Error details.
 * @param {string} message - Summary failure message.
 * @returns {import('express').Response}
 */
export const sendError = (res, statusCode = 500, errorMessage = 'Internal Server Error', message = 'Operation failed') => {
  return res.status(statusCode).json({
    success: false,
    data: null,
    error: errorMessage,
    message
  });
};
