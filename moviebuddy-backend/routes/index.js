import { Router } from 'express';
import titleRoutes from './titleRoutes.js';
import reviewRoutes from './reviewRoutes.js';
import userRoutes from './userRoutes.js';
import textRoutes from './textRoutes.js';
import { sendSuccess } from '../utils/responses.js';

const router = Router();

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  return sendSuccess(res, 200, { status: 'UP', timestamp: new Date().toISOString() }, 'MovieBuddy API is running');
});

router.use('/title', titleRoutes);
router.use('/review', reviewRoutes);
router.use('/user', userRoutes);
router.use('/text', textRoutes);

export default router;
