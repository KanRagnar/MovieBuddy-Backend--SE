import { AppError } from '../utils/validators.js';

/**
 * Validates review creation/update request payloads according to OpenAPI & User Stories (max 80 chars, rate 1-10).
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next callback.
 */
export const validateReviewPayload = (req, res, next) => {
  const { comment, rate } = req.body;

  if (comment === undefined || typeof comment !== 'string' || comment.trim() === '') {
    return next(new AppError('Review comment is required and must be a non-empty string', 400));
  }
  if (comment.length > 80) {
    return next(new AppError('Review comment must not exceed 80 characters', 400));
  }
  const numericRate = Number(rate);
  if (rate === undefined || Number.isNaN(numericRate) || numericRate < 1 || numericRate > 10) {
    return next(new AppError('Review rate is required and must be a number between 1 and 10', 400));
  }
  next();
};

/**
 * Validates user creation/update request payloads.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next callback.
 */
export const validateUserPayload = (req, res, next) => {
  const { name, age } = req.body;
  if (req.method === 'POST') {
    if (!req.body.userId || !name || age === undefined) {
      return next(new AppError('Fields userId, name, and age are required', 400));
    }
  }
  if (age !== undefined && (Number.isNaN(Number(age)) || Number(age) < 18)) {
    return next(new AppError('Age must be a valid number of at least 18', 400));
  }
  next();
};

/**
 * Validates text/chat message payload.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next callback.
 */
export const validateTextPayload = (req, res, next) => {
  const { script, receiver } = req.body;
  if (!script || typeof script !== 'string' || script.trim() === '') {
    return next(new AppError('Message script is required', 400));
  }
  if (!receiver) {
    return next(new AppError('Receiver user identifier is required', 400));
  }
  next();
};
