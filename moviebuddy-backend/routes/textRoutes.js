import { Router } from 'express';
import * as textController from '../controllers/textController.js';
import { validateTextPayload } from '../middleware/validation.js';

const router = Router();

router.post('/', validateTextPayload, textController.createText);
router.get('/:textId', textController.getTextById);
router.delete('/:textId', textController.deleteText);

export default router;
