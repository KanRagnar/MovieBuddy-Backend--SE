import { Router } from 'express';
import * as reviewController from '../controllers/reviewController.js';
import { validateBody, validateIds } from '../middleware/validation.js';
import { validateReviewPayload } from '../utils/validators.js';

const router = Router();

router.get('/:reviewId', validateIds('reviewId'), reviewController.getReview);
router.put('/:reviewId', validateIds('reviewId'), validateBody(validateReviewPayload, { partial: true }), reviewController.updateReview);
router.delete('/:reviewId', validateIds('reviewId'), reviewController.deleteReview);

export default router;
