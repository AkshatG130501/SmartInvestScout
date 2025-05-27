import { Request, Response } from 'express';
import {
  subscribeToPricingNotifications,
  unsubscribeFromPricingNotifications,
} from '../services/notificationService';
import { logger } from '../utils/logger';

export class NotificationsController {
  private static instance: NotificationsController;

  private constructor() {}

  public static getInstance(): NotificationsController {
    if (!NotificationsController.instance) {
      NotificationsController.instance = new NotificationsController();
    }
    return NotificationsController.instance;
  }

  public async subscribeToPricing(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required' });
      }

      const result = await subscribeToPricingNotifications(email);
      return res.json(result);
    } catch (error) {
      logger.error('Error in pricing subscription endpoint:', error);
      return res
        .status(500)
        .json({ success: false, message: 'Failed to subscribe to pricing notifications' });
    }
  }

  public async unsubscribeFromPricing(req: Request, res: Response) {
    try {
      const email = req.query.email as string;

      if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required' });
      }

      const success = await unsubscribeFromPricingNotifications(email);

      if (success) {
        return res.json({
          success: true,
          message: 'Successfully unsubscribed from pricing notifications',
        });
      } else {
        return res
          .status(500)
          .json({ success: false, message: 'Failed to unsubscribe from pricing notifications' });
      }
    } catch (error) {
      logger.error('Error in pricing unsubscription endpoint:', error);
      return res
        .status(500)
        .json({ success: false, message: 'Failed to unsubscribe from pricing notifications' });
    }
  }
}
