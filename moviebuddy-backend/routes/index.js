import { Router } from 'express';
import { getDatabaseMode } from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import { sendSuccess } from '../utils/responses.js';
import reviewRoutes from './reviewRoutes.js';
import socialRoutes from './socialRoutes.js';
import textRoutes from './textRoutes.js';
import titleRoutes from './titleRoutes.js';
import userRoutes from './userRoutes.js';

const router = Router();

// Identify the caller for every request (see middleware/auth.js).
router.use(authenticate);

router.get('/', (_req, res) => {
  sendSuccess(res, { name: 'MovieBuddy API', version: '1.0.0', resources: ['/title', '/review', '/user', '/text'] }, 'MovieBuddy API is running');
});

router.get('/health', (_req, res) => {
  sendSuccess(res, { status: 'ok', storage: getDatabaseMode(), uptimeSeconds: Math.round(process.uptime()) }, 'Healthy');
});

router.use('/title', titleRoutes);
router.use('/review', reviewRoutes);
router.use('/user', userRoutes);
router.use('/user', socialRoutes);
router.use('/text', textRoutes);

export default router;
