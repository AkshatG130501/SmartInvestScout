import { Request, Response } from 'express';
import {
  getUserAlertPreferences,
  updateAlertPreferences,
  getUserAlerts,
  markAlertsAsRead,
  countUnreadAlerts,
  runManualProcessing,
} from '../services/alertService';
import { AlertPreferences } from '../types/alerts';
import { logger } from '../utils/logger';

export class AlertsController {
  private static instance: AlertsController;

  private constructor() {}

  public static getInstance(): AlertsController {
    if (!AlertsController.instance) {
      AlertsController.instance = new AlertsController();
    }
    return AlertsController.instance;
  }

  public async getUserAlerts(req: Request, res: Response) {
    try {
      const userId = req.query.userId as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const alerts = await getUserAlerts(userId, limit, offset);
      return res.json({ alerts });
    } catch (error) {
      logger.error('Error in get alerts endpoint:', error);
      return res.status(500).json({ error: 'Failed to fetch alerts' });
    }
  }

  public async getAlertPreferences(req: Request, res: Response) {
    try {
      const userId = req.query.userId as string;

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const preferences = await getUserAlertPreferences(userId);

      if (!preferences) {
        // Return default preferences if none exist
        return res.json({
          userId,
          companies: [],
          sectors: [],
          frequency: 'daily',
          notificationChannels: ['app'],
          minImpactLevel: 'medium',
        } as AlertPreferences);
      }

      return res.json(preferences);
    } catch (error) {
      logger.error('Error in get alert preferences endpoint:', error);
      return res.status(500).json({ error: 'Failed to fetch alert preferences' });
    }
  }

  public async updateAlertPreferences(req: Request, res: Response) {
    try {
      const preferences = req.body as AlertPreferences;

      if (!preferences.userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const success = await updateAlertPreferences(preferences);

      if (!success) {
        return res.status(500).json({ error: 'Failed to update alert preferences' });
      }

      return res.json({ success: true });
    } catch (error) {
      logger.error('Error in update alert preferences endpoint:', error);
      return res.status(500).json({ error: 'Failed to update alert preferences' });
    }
  }

  public async markAlertsAsRead(req: Request, res: Response) {
    try {
      const { userId, alertIds } = req.body;

      if (!userId || !alertIds || !Array.isArray(alertIds)) {
        return res.status(400).json({ error: 'User ID and alert IDs array are required' });
      }

      const success = await markAlertsAsRead(userId, alertIds);

      if (!success) {
        return res.status(500).json({ error: 'Failed to mark alerts as read' });
      }

      return res.json({ success: true });
    } catch (error) {
      logger.error('Error in mark alerts as read endpoint:', error);
      return res.status(500).json({ error: 'Failed to mark alerts as read' });
    }
  }

  public async getUnreadAlertCount(req: Request, res: Response) {
    try {
      const userId = req.query.userId as string;

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const count = await countUnreadAlerts(userId);
      return res.json({ count });
    } catch (error) {
      logger.error('Error in get unread alert count endpoint:', error);
      return res.status(500).json({ error: 'Failed to fetch unread alert count' });
    }
  }

  public async processMarketEvents(req: Request, res: Response) {
    try {
      // This endpoint should be protected with admin authentication
      const { apiKey } = req.body;

      // Simple API key check (should be more robust in production)
      if (apiKey !== process.env.ADMIN_API_KEY) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const alertsCreated = await runManualProcessing();
      return res.json({ success: true, alertsCreated });
    } catch (error) {
      logger.error('Error in manual processing endpoint:', error);
      return res.status(500).json({ error: 'Failed to process market events' });
    }
  }
}
