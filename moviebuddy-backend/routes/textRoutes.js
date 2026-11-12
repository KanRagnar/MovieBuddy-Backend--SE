import { Router } from 'express';
import * as textController from '../controllers/textController.js';
import { validateBody, validateIds } from '../middleware/validation.js';
import { validateTextPayload } from '../utils/validators.js';

const router = Router();

router.post('/', validateBody(validateTextPayload), textController.createText);
router.get('/:textId', validateIds('textId'), textController.getText);
router.delete('/:textId', validateIds('textId'), textController.deleteText);

export default router;
