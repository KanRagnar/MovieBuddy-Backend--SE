/**
 * Base class for all expected (operational) errors. The central error
 * middleware turns these into proper HTTP responses.
 */
export class AppError extends Error {
  /**
   * @param {string} message Human readable message.
   * @param {number} [statusCode=500] HTTP status code.
   * @param {string} [code='INTERNAL_ERROR'] Machine readable error code.
   */
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
  }
}

/** 400 - malformed request. */
export class BadRequestError extends AppError {
  /**
   * @param {string} [message] Error message.
   * @param {string} [code] Error code.
   */
  constructor(message = 'Bad request', code = 'BAD_REQUEST') {
    super(message, 400, code);
  }
}

/** 400 - request body failed validation. */
export class ValidationError extends AppError {
  /**
   * @param {string} [message] Error message.
   */
  constructor(message = 'Validation failed') {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

/** 401 - missing or invalid credentials. */
export class UnauthorizedError extends AppError {
  /**
   * @param {string} [message] Error message.
   * @param {string} [code] Error code.
   */
  constructor(message = 'Unauthorized', code = 'UNAUTHORIZED') {
    super(message, 401, code);
  }
}

/** 403 - authenticated but not allowed. */
export class ForbiddenError extends AppError {
  /**
   * @param {string} [message] Error message.
   * @param {string} [code] Error code.
   */
  constructor(message = 'Forbidden', code = 'FORBIDDEN') {
    super(message, 403, code);
  }
}

/** 404 - resource does not exist. */
export class NotFoundError extends AppError {
  /**
   * @param {string} [message] Error message.
   * @param {string} [code] Error code.
   */
  constructor(message = 'Not found', code = 'NOT_FOUND') {
    super(message, 404, code);
  }
}

/** 409 - request conflicts with current state (duplicates etc.). */
export class ConflictError extends AppError {
  /**
   * @param {string} [message] Error message.
   * @param {string} [code] Error code.
   */
  constructor(message = 'Conflict', code = 'CONFLICT') {
    super(message, 409, code);
  }
}
