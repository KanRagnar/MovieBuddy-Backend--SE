import { config } from '../config/constants.js';
import { AppError, NotFoundError } from '../utils/errors.js';
import { sendError } from '../utils/responses.js';

/**
 * Catches requests that matched no route.
 * @param {import('express').Request} req Express request.
 * @param {import('express').Response} _res Express response.
 * @param {import('express').NextFunction} next Next middleware.
 */
export function notFoundHandler(req, _res, next) {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`, 'ROUTE_NOT_FOUND'));
}

/**
 * Central error middleware. Differentiates application errors, body-parser
 * errors, Mongoose errors and unexpected failures.
 * @param {Error} err Error raised by a handler.
 * @param {import('express').Request} _req Express request.
 * @param {import('express').Response} res Express response.
 * @param {import('express').NextFunction} next Next middleware.
 * @returns {void}
 */
export function errorHandler(err, _req, res, next) {
  if (res.headersSent) return next(err);

  let status = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'Internal server error';

  if (err instanceof AppError) {
    ({ statusCode: status, code, message } = err);
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    code = 'INVALID_JSON';
    message = 'Request body contains invalid JSON';
  } else if (err.type === 'entity.too.large') {
    status = 413;
    code = 'PAYLOAD_TOO_LARGE';
    message = 'Request body is too large';
  } else if (err.name === 'ValidationError' && err.errors) {
    status = 400;
    code = 'VALIDATION_ERROR';
    message = Object.values(err.errors).map((e) => e.message).join('; ');
  } else if (err.name === 'CastError') {
    status = 400;
    code = 'INVALID_ID';
    message = `Invalid value for ${err.path}`;
  } else if (err.code === 11000) {
    status = 409;
    code = 'DUPLICATE_KEY';
    message = 'A record with the same unique value already exists';
  }

  if (status >= 500) {
    console.error(err);
    if (config.env !== 'production') message = err.message || message;
  }

  return sendError(res, status, code, message);
}
