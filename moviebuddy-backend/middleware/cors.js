import { config } from '../config/constants.js';

/**
 * Minimal CORS middleware so the frontend (served from another origin) can call the API.
 * @param {import('express').Request} req Express request.
 * @param {import('express').Response} res Express response.
 * @param {import('express').NextFunction} next Next middleware.
 */
export function cors(req, res, next) {
  res.set({
    'Access-Control-Allow-Origin': config.corsOrigin,
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-Id',
    'Access-Control-Max-Age': '600',
    Vary: 'Origin'
  });
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  return next();
}
