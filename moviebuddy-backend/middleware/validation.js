import { BadRequestError, ValidationError } from '../utils/errors.js';

/**
 * Builds a middleware that validates `req.body` with one of the validators
 * from utils/validators.js.
 * @param {(body: object, options?: object) => string[]} validator Validator returning error messages.
 * @param {object} [options] Options forwarded to the validator (e.g. `{ partial: true }`).
 * @returns {import('express').RequestHandler} Express middleware.
 */
export function validateBody(validator, options) {
  return (req, _res, next) => {
    const errors = validator(req.body ?? {}, options);
    if (errors.length > 0) return next(new ValidationError(errors.join('; ')));
    return next();
  };
}

/**
 * Builds a middleware that checks the named route params are positive integers.
 * @param {...string} names Param names, e.g. `'titleId'`.
 * @returns {import('express').RequestHandler} Express middleware.
 */
export function validateIds(...names) {
  return (req, _res, next) => {
    for (const name of names) {
      if (!/^[1-9]\d*$/.test(req.params[name] ?? '')) {
        return next(new BadRequestError(`${name} must be a positive integer`, 'INVALID_ID'));
      }
    }
    return next();
  };
}
