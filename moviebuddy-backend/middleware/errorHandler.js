import { sendError } from '../utils/responses.js';

/**
 * Centralized error-handling middleware differentiating error types.
 * @param {Error} err - Caught error object.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next callback.
 */
export const errorHandler = (err, req, res, next) => {
  console.error(`[ErrorHandler] ${err.name}: ${err.message}`);

  if (err.name === 'AppError') {
    return sendError(res, err.statusCode, err.message, 'Request error');
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors || {}).map((val) => val.message).join(', ');
    return sendError(res, 400, messages || err.message, 'Validation failed');
  }

  if (err.name === 'CastError') {
    return sendError(res, 400, `Invalid value for ${err.path}: ${err.value}`, 'Invalid parameter');
  }

  if (err.code === 11000) {
    return sendError(res, 409, 'Duplicate field value entered', 'Conflict error');
  }

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return sendError(res, 400, 'Malformed JSON request body', 'Bad request');
  }

  const statusCode = err.statusCode || 500;
  return sendError(res, statusCode, err.message || 'Internal Server Error', 'Server error');
};
