/**
 * @file Notifications API client
 * @description Client functions for notifications-related API endpoints
 */

import api from './client';
import { API_BASE_URL } from './index';
import { formatErrorMessage } from './errors';

/**
 * Interface for notification subscription response
 */
export interface NotificationSubscriptionResponse {
  success: boolean;
  message: string;
}

/**
 * Subscribe to pricing notifications
 * @param email Email address to subscribe
 * @returns Promise with subscription response
 */
export const subscribeToPricingNotifications = async (
  email: string
): Promise<NotificationSubscriptionResponse> => {
  try {
    const response = await api.post<NotificationSubscriptionResponse>(
      `${API_BASE_URL}/api/notifications/pricing/subscribe`,
      { email }
    );
    return response.data;
  } catch (error) {
    console.error('Error subscribing to pricing notifications:', formatErrorMessage(error));
    return {
      success: false,
      message: 'Failed to subscribe. Please try again later.'
    };
  }
};

/**
 * Unsubscribe from pricing notifications
 * @param email Email address to unsubscribe
 * @returns Promise with unsubscription response
 */
export const unsubscribeFromPricingNotifications = async (
  email: string
): Promise<NotificationSubscriptionResponse> => {
  try {
    const response = await api.get<NotificationSubscriptionResponse>(
      `${API_BASE_URL}/api/notifications/pricing/unsubscribe?email=${encodeURIComponent(email)}`
    );
    return response.data;
  } catch (error) {
    console.error('Error unsubscribing from pricing notifications:', formatErrorMessage(error));
    return {
      success: false,
      message: 'Failed to unsubscribe. Please try again later.'
    };
  }
};
