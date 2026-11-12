import { config } from '../config/constants.js';

/**
 * Logs every request with its status code and duration (silent when NODE_ENV=test).
 * @param {import('express').Request} req Express request.
 * @param {import('express').Response} res Express response.
 * @param {import('express').NextFunction} next Next middleware.
 */
export function requestLogger(req, res, next) {
  if (config.env === 'test') return next();
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl} ${res.statusCode} ${ms.toFixed(1)}ms`);
  });
  next();
}
