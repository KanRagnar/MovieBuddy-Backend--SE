/**
 * Custom application error class carrying HTTP status codes.
 */
export class AppError extends Error {
  /**
   * @param {string} message - Error message.
   * @param {number} statusCode - HTTP status code.
   */
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Parses and validates a positive integer ID parameter.
 * @param {string|number} rawId - Raw ID value from params.
 * @param {string} fieldName - Name of the parameter for error reporting.
 * @returns {number} Parsed integer ID.
 * @throws {AppError} If ID is not a valid positive integer.
 */
export const parseId = (rawId, fieldName = 'id') => {
  const parsed = Number(rawId);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new AppError(`Invalid ${fieldName}: must be a positive integer`, 400);
  }
  return parsed;
};
