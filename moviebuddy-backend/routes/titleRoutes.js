import { Router } from 'express';
import * as reviewController from '../controllers/reviewController.js';
import * as titleController from '../controllers/titleController.js';
import { validateBody, validateIds } from '../middleware/validation.js';
import { validateReviewPayload, validateTitlePayload } from '../utils/validators.js';

const router = Router();

// Static paths must be declared before "/:titleId".
router.get('/', titleController.listTitles);
router.get('/genres', titleController.listGenres);
router.get('/search', titleController.searchTitles);
router.post('/', validateBody(validateTitlePayload), titleController.createTitle);

router.get('/:titleId', validateIds('titleId'), titleController.getTitle);
router.get('/:titleId/reviews', validateIds('titleId'), reviewController.listTitleReviews);
router.post('/:titleId/Review', validateIds('titleId'), validateBody(validateReviewPayload), reviewController.createReview);
router.post('/:titleId/AddToFavorites', validateIds('titleId'), titleController.addToFavorites);
router.delete('/:titleId/AddToFavorites', validateIds('titleId'), titleController.removeFromFavorites);

export default router;
