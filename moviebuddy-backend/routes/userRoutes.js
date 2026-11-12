import { Router } from 'express';
import * as textController from '../controllers/textController.js';
import * as userController from '../controllers/userController.js';
import { validateBody, validateIds } from '../middleware/validation.js';
import {
  validateEmailPayload,
  validateLocationPayload,
  validatePasswordPayload,
  validateShownFavoritesPayload,
  validateTextPayload,
  validateUserPayload
} from '../utils/validators.js';

const router = Router();

router.get('/', userController.listUsers);
router.post('/', validateBody(validateUserPayload), userController.createUser);

// Static paths must be declared before "/:userId".
router.get('/login', userController.login);
router.post('/login', userController.login);
router.get('/logout', userController.logout);

router.get('/:userId', validateIds('userId'), userController.getUser);
router.put('/:userId', validateIds('userId'), validateBody(validateUserPayload, { partial: true }), userController.updateUser);
router.delete('/:userId', validateIds('userId'), userController.deleteUser);

router.put('/:userId/password', validateIds('userId'), validateBody(validatePasswordPayload), userController.updatePassword);
router.put('/:userId/email', validateIds('userId'), validateBody(validateEmailPayload), userController.updateEmail);
router.put('/:userId/location', validateIds('userId'), validateBody(validateLocationPayload), userController.updateLocation);

router.get('/:userId/favorites', validateIds('userId'), userController.getFavorites);
router.put('/:userId/favorites/shown', validateIds('userId'), validateBody(validateShownFavoritesPayload), userController.setShownFavorites);

// Texts of a user; ":senderId" may be a numeric id or a username.
router.get('/:senderId/text', textController.listTextsSentBy);
router.post('/:senderId/text', validateBody(validateTextPayload), textController.createTextForUser);

export default router;
