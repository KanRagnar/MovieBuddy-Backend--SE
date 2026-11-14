import { AppError } from '../utils/validators.js';

/**
 * Basic authentication middleware checking for Bearer token or x-user-id header.
 * Allows public routes while attaching user context when credentials are supplied.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next callback.
 */
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const userIdHeader = req.headers['x-user-id'];

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    req.currentUser = { token, userId: userIdHeader || 'sampleuser', id: 1 };
  } else if (userIdHeader) {
    req.currentUser = { userId: userIdHeader, id: Number(userIdHeader) || 1 };
  } else {
    // Default demo user context so frontend/Swagger calls work out-of-the-box
    req.currentUser = { id: 1, userId: 'sampleuser' };
  }
  next();
};

/**
 * Strict authentication guard for protected actions when explicitly enforced.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next callback.
 */
export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const userIdHeader = req.headers['x-user-id'];

  if (!authHeader && !userIdHeader) {
    return next(new AppError('Unauthorized: Missing authentication credentials', 401));
  }
  return optionalAuth(req, res, next);
};
