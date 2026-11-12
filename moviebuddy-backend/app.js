import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { requestLogger } from './middleware/logger.js';
import { optionalAuth } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';
import { AppError } from './utils/validators.js';

const app = express();

// Core middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);
app.use(optionalAuth);

// Mount all API routes both at root (per OpenAPI spec) and /api
app.use('/api', routes);
app.use('/', routes);

// 404 Not Found handler
app.use((req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
});

// Centralized error handling middleware
app.use(errorHandler);

export default app;
