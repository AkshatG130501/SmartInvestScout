import express from 'express';
import {
  getUserAlertPreferences,
  updateAlertPreferences,
  getUserAlerts,
  markAlertsAsRead,
  countUnreadAlerts,
  runManualProcessing
} from '../services/alertService';
import { AlertPreferences } from '../types/alerts';

const alertsRouter = express.Router();

// Get user alerts (root path)
alertsRouter.get('/', async (req, res) => {
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
    console.error('Error in get alerts endpoint:', error);
    return res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Get user alert preferences
alertsRouter.get('/preferences', async (req, res) => {
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
        minImpactLevel: 'medium'
      } as AlertPreferences);
    }
    
    return res.json(preferences);
  } catch (error) {
    console.error('Error in get alert preferences endpoint:', error);
    return res.status(500).json({ error: 'Failed to fetch alert preferences' });
  }
});

// Update user alert preferences
alertsRouter.post('/preferences', async (req, res) => {
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
    console.error('Error in update alert preferences endpoint:', error);
    return res.status(500).json({ error: 'Failed to update alert preferences' });
  }
});

// Mark alerts as read
alertsRouter.post('/read', async (req, res) => {
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
    console.error('Error in mark alerts as read endpoint:', error);
    return res.status(500).json({ error: 'Failed to mark alerts as read' });
  }
});

// Get unread alert count
alertsRouter.get('/unread/count', async (req, res) => {
  try {
    const userId = req.query.userId as string;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const count = await countUnreadAlerts(userId);
    return res.json({ count });
  } catch (error) {
    console.error('Error in get unread alert count endpoint:', error);
    return res.status(500).json({ error: 'Failed to fetch unread alert count' });
  }
});

// Manually trigger market event processing (for testing/admin)
alertsRouter.post('/process', async (req, res) => {
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
    console.error('Error in manual processing endpoint:', error);
    return res.status(500).json({ error: 'Failed to process market events' });
  }
});

export default alertsRouter;
