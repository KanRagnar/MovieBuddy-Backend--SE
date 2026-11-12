import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import * as textController from '../controllers/textController.js';
import { validateUserPayload, validateTextPayload } from '../middleware/validation.js';

const router = Router();

router.get('/', userController.getUsers);
router.post('/', validateUserPayload, userController.createUser);
router.get('/login', userController.loginUser);
router.get('/logout', userController.logoutUser);
router.get('/:userId', userController.getUserById);
router.put('/:userId', validateUserPayload, userController.updateUser);
router.delete('/:userId', userController.deleteUser);
router.put('/:userId/password', userController.updatePassword);
router.put('/:userId/email', userController.updateEmail);
router.post('/:userId/swipe', userController.swipeUserProfile);

// Nested user text routes from OpenAPI specification
router.get('/:senderId/text', textController.getUserTexts);
router.post('/:senderId/text', validateTextPayload, textController.createUserText);

export default router;
