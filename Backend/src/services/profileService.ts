import { createClient } from '@supabase/supabase-js';
import { UserProfile, UserProfileInput } from '../types/userProfile';
import { logger } from '../utils/logger';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export class ProfileService {
  private static instance: ProfileService;

  private constructor() {}

  public static getInstance(): ProfileService {
    if (!ProfileService.instance) {
      ProfileService.instance = new ProfileService();
    }
    return ProfileService.instance;
  }

  /**
   * Get a user profile by user ID
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        logger.error(`Error fetching user profile: ${error.message}`);
        return null;
      }

      return data as UserProfile;
    } catch (error) {
      logger.error('Error in getUserProfile:', error);
      return null;
    }
  }

  /**
   * Create a new user profile
   */
  async createUserProfile(userId: string, profileData: UserProfileInput): Promise<UserProfile | null> {
    try {
      // Log the Supabase URL (without the key for security)
      logger.info(`Using Supabase URL: ${supabaseUrl}`);
      logger.info(`Creating profile for user ${userId} with data structure: ${JSON.stringify({
        risk_appetite: profileData.risk_appetite,
        investment_goals: profileData.investment_goals?.length || 0,
        watchlist: profileData.watchlist?.length || 0,
        holdings: profileData.holdings?.length || 0
      })}`);
      
      // Check if the table exists by attempting a minimal query
      const { error: tableCheckError } = await supabase
        .from('user_profiles')
        .select('id')
        .limit(1);
      
      if (tableCheckError) {
        logger.error(`Table check error: ${tableCheckError.message}`);
        throw new Error(`Table 'user_profiles' may not exist: ${tableCheckError.message}`);
      }
      
      const { data, error } = await supabase
        .from('user_profiles')
        .insert([
          {
            user_id: userId,
            risk_appetite: profileData.risk_appetite,
            investment_goals: profileData.investment_goals,
            watchlist: profileData.watchlist,
            holdings: profileData.holdings
          }
        ])
        .select()
        .single();

      if (error) {
        logger.error(`Error creating user profile: ${error.message}`);
        logger.error(`Error details: ${JSON.stringify(error)}`);
        throw new Error(`Supabase error: ${error.message}`);
      }

      logger.info('Profile created successfully in Supabase');
      return data as UserProfile;
    } catch (error) {
      logger.error('Error in createUserProfile:', error);
      throw error; // Re-throw to let the route handler catch and process it
    }
  }

  /**
   * Update an existing user profile
   */
  async updateUserProfile(userId: string, profileData: Partial<UserProfileInput>): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(profileData)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        logger.error(`Error updating user profile: ${error.message}`);
        return null;
      }

      return data as UserProfile;
    } catch (error) {
      logger.error('Error in updateUserProfile:', error);
      return null;
    }
  }

  /**
   * Delete a user profile
   */
  async deleteUserProfile(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', userId);

      if (error) {
        logger.error(`Error deleting user profile: ${error.message}`);
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error in deleteUserProfile:', error);
      return false;
    }
  }
}
