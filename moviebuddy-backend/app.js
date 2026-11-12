import express from 'express';
import { config } from './config/constants.js';
import { cors } from './middleware/cors.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/logger.js';
import routes from './routes/index.js';

/**
 * Builds the Express application (without starting it). Call connectDatabase() before handling requests.
 * @returns {import('express').Express} Configured app.
 */
export function createApp() {
  const app = express();
  app.disable('x-powered-by');

  app.use(requestLogger);
  app.use(cors);
  app.use((_req, res, next) => {
    res.set('X-Content-Type-Options', 'nosniff');
    next();
  });
  app.use(express.json({ limit: '5mb' })); // profile images may be sent as base64

  app.use(config.apiPrefix || '/', routes);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}

export default createApp();
