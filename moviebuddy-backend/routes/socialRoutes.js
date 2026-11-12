import { Router } from 'express';
import * as socialController from '../controllers/socialController.js';
import { validateBody, validateIds } from '../middleware/validation.js';
import { validateSwipePayload } from '../utils/validators.js';

// Mounted under /user: swiping, matches/chat and notifications of a user.
const router = Router();

router.get('/:userId/suggestions', validateIds('userId'), socialController.getSuggestion);
router.post('/:userId/swipe', validateIds('userId'), validateBody(validateSwipePayload), socialController.swipe);

router.get('/:userId/matches', validateIds('userId'), socialController.listMatches);
router.get('/:userId/matches/:matchId/texts', validateIds('userId', 'matchId'), socialController.getMatchTexts);
router.delete('/:userId/matches/:matchId', validateIds('userId', 'matchId'), socialController.unmatch);

router.get('/:userId/notifications', validateIds('userId'), socialController.listNotifications);
router.put('/:userId/notifications/:notificationId/read', validateIds('userId', 'notificationId'), socialController.markNotificationRead);

export default router;
