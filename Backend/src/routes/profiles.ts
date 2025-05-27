import { Router } from 'express';
import { ProfilesController } from '../controllers/profilesController';

const router = Router();
const profilesController = ProfilesController.getInstance();

// Get user profile
router.get('/:userId', profilesController.getUserProfile.bind(profilesController));

// Create user profile
router.post('/:userId', profilesController.createUserProfile.bind(profilesController));

// Update user profile
router.put('/:userId', profilesController.updateUserProfile.bind(profilesController));

// Delete user profile
router.delete('/:userId', profilesController.deleteUserProfile.bind(profilesController));

export default router;
