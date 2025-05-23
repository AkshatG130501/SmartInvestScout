import { Router } from 'express';
import { ProfileService } from '../services/profileService';
import { UserProfileInput } from '../types/userProfile';
import { logger } from '../utils/logger';

export const profilesRouter = Router();
const profileService = ProfileService.getInstance();

// Get user profile
profilesRouter.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const profile = await profileService.getUserProfile(userId);
    
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    return res.status(200).json(profile);
  } catch (error) {
    logger.error('Error fetching profile:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Create user profile
profilesRouter.post('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const profileData: UserProfileInput = req.body;
    
    logger.info(`Creating profile for user ${userId}`);
    logger.info(`Profile data: ${JSON.stringify(profileData)}`);
    
    // Check if profile already exists
    const existingProfile = await profileService.getUserProfile(userId);
    
    if (existingProfile) {
      logger.info('Profile already exists, returning 409');
      return res.status(409).json({ message: 'Profile already exists' });
    }
    
    // Check if Supabase is properly configured
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      logger.error('Missing Supabase environment variables');
      return res.status(500).json({ message: 'Server configuration error: Missing Supabase environment variables' });
    }
    
    const newProfile = await profileService.createUserProfile(userId, profileData);
    
    if (!newProfile) {
      logger.error('Failed to create profile, service returned null');
      return res.status(500).json({ message: 'Failed to create profile' });
    }
    
    logger.info('Profile created successfully');
    return res.status(201).json(newProfile);
  } catch (error) {
    logger.error('Error creating profile:', error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Update user profile
profilesRouter.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const profileData: Partial<UserProfileInput> = req.body;
    
    // Check if profile exists
    const existingProfile = await profileService.getUserProfile(userId);
    
    if (!existingProfile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    const updatedProfile = await profileService.updateUserProfile(userId, profileData);
    
    if (!updatedProfile) {
      return res.status(500).json({ message: 'Failed to update profile' });
    }
    
    return res.status(200).json(updatedProfile);
  } catch (error) {
    logger.error('Error updating profile:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete user profile
profilesRouter.delete('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if profile exists
    const existingProfile = await profileService.getUserProfile(userId);
    
    if (!existingProfile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    const success = await profileService.deleteUserProfile(userId);
    
    if (!success) {
      return res.status(500).json({ message: 'Failed to delete profile' });
    }
    
    return res.status(204).send();
  } catch (error) {
    logger.error('Error deleting profile:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});
