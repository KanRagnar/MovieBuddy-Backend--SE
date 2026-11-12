import { Router } from 'express';
import * as titleController from '../controllers/titleController.js';
import * as reviewController from '../controllers/reviewController.js';
import { validateReviewPayload } from '../middleware/validation.js';

const router = Router();

router.get('/', titleController.getTitles);
router.get('/search', titleController.searchTitles);
router.get('/:titleId', titleController.getTitleById);
router.post('/:titleId/AddToFavorites', titleController.addToFavorites);
router.delete('/:titleId/AddToFavorites', titleController.removeFromFavorites);
router.post('/:titleId/Review', validateReviewPayload, reviewController.addReviewToTitle);

export default router;
