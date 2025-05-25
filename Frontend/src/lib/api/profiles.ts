import api from './client';
import { UserProfile, UserProfileInput } from './types';
import { isNotFoundError, formatErrorMessage } from './errors';
import axios from 'axios';
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_BASE_URL;
/**
 * Fetches a user profile by user ID
 * @param userId The ID of the user
 * @returns The user profile or null if not found
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const response = await api.get(`api/profiles/${userId}`);
    return response.data as UserProfile;
  } catch (error: unknown) {
    if (isNotFoundError(error)) {
      return null; // Profile not found
    }
    console.error("Error fetching user profile:", formatErrorMessage(error));
    throw error;
  }
};

/**
 * Creates a new user profile
 * @param userId The ID of the user
 * @param profileData The profile data to create
 * @returns The created user profile
 */
export const createUserProfile = async (userId: string, profileData: UserProfileInput): Promise<UserProfile> => {
  try {
    const response = await api.post(`api/profiles/${userId}`, profileData);
    return response.data as UserProfile;
  } catch (error: unknown) {
    console.error("Error creating user profile:", formatErrorMessage(error));
    throw error;
  }
};

/**
 * Updates an existing user profile
 * @param userId The ID of the user
 * @param profileData The profile data to update
 * @returns The updated user profile
 */
export const updateUserProfile = async (userId: string, profileData: Partial<UserProfileInput>): Promise<UserProfile> => {
  try {
    const response = await api.put(`api/profiles/${userId}`, profileData);
    return response.data as UserProfile;
  } catch (error: unknown) {
    console.error("Error updating user profile:", formatErrorMessage(error));
    throw error;
  }
};
