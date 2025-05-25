/**
 * @file Notification service
 * @description Provides functionality for managing user notifications
 */

import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Interface for pricing notification subscriber
 */
export interface PricingSubscriber {
  id?: string;
  email: string;
  created_at?: string;
  updated_at?: string;
  notification_sent?: boolean;
  notification_sent_at?: string;
}

/**
 * Subscribe a user to pricing notifications
 * @param email User's email address
 * @returns Success status and message
 */
export async function subscribeToPricingNotifications(email: string): Promise<{ success: boolean; message: string }> {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, message: 'Invalid email format' };
    }

    // Check if email already exists
    const { data: existingSubscriber, error: checkError } = await supabase
      .from('pricing_notification_subscribers')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (checkError) {
      logger.error('Error checking existing subscriber:', checkError);
      return { success: false, message: 'Error checking subscription status' };
    }

    if (existingSubscriber) {
      // Email already subscribed, update the record to ensure notification_sent is false
      const { error: updateError } = await supabase
        .from('pricing_notification_subscribers')
        .update({ notification_sent: false })
        .eq('id', existingSubscriber.id);

      if (updateError) {
        logger.error('Error updating existing subscriber:', updateError);
        return { success: false, message: 'Error updating subscription' };
      }

      return { success: true, message: 'You are already subscribed to pricing notifications' };
    }

    // Insert new subscriber
    const { error: insertError } = await supabase
      .from('pricing_notification_subscribers')
      .insert([{ email }]);

    if (insertError) {
      logger.error('Error inserting new subscriber:', insertError);
      return { success: false, message: 'Error creating subscription' };
    }

    return { success: true, message: 'Successfully subscribed to pricing notifications' };
  } catch (error) {
    logger.error('Error in subscribeToPricingNotifications:', error);
    return { success: false, message: 'An unexpected error occurred' };
  }
}

/**
 * Get all pricing notification subscribers
 * @param includeNotified Whether to include subscribers who have already been notified
 * @returns Array of pricing notification subscribers
 */
export async function getPricingSubscribers(includeNotified: boolean = false): Promise<PricingSubscriber[]> {
  try {
    let query = supabase
      .from('pricing_notification_subscribers')
      .select('*')
      .order('created_at', { ascending: false });

    if (!includeNotified) {
      query = query.eq('notification_sent', false);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Error fetching pricing subscribers:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    logger.error('Error in getPricingSubscribers:', error);
    return [];
  }
}

/**
 * Mark subscribers as notified
 * @param subscriberIds Array of subscriber IDs to mark as notified
 * @returns Success status
 */
export async function markSubscribersAsNotified(subscriberIds: string[]): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('pricing_notification_subscribers')
      .update({ 
        notification_sent: true,
        notification_sent_at: new Date().toISOString()
      })
      .in('id', subscriberIds);

    if (error) {
      logger.error('Error marking subscribers as notified:', error);
      return false;
    }

    return true;
  } catch (error) {
    logger.error('Error in markSubscribersAsNotified:', error);
    return false;
  }
}

/**
 * Unsubscribe from pricing notifications
 * @param email User's email address
 * @returns Success status
 */
export async function unsubscribeFromPricingNotifications(email: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('pricing_notification_subscribers')
      .delete()
      .eq('email', email);

    if (error) {
      logger.error('Error unsubscribing from pricing notifications:', error);
      return false;
    }

    return true;
  } catch (error) {
    logger.error('Error in unsubscribeFromPricingNotifications:', error);
    return false;
  }
}
