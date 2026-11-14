import { Router } from 'express';
import * as reviewController from '../controllers/reviewController.js';
import { validateReviewPayload } from '../middleware/validation.js';

const router = Router();

router.get('/', reviewController.getReviews);
router.get('/:reviewId', reviewController.getReviewById);
router.put('/:reviewId', validateReviewPayload, reviewController.updateReview);
router.delete('/:reviewId', reviewController.deleteReview);

export default router;
