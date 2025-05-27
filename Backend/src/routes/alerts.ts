import express from 'express';
import { AlertsController } from '../controllers/alertsController';

const router = express.Router();
const alertsController = AlertsController.getInstance();

// Get user alerts (root path)
router.get('/', alertsController.getUserAlerts.bind(alertsController));

// Get user alert preferences
router.get('/preferences', alertsController.getAlertPreferences.bind(alertsController));

// Update user alert preferences
router.post('/preferences', alertsController.updateAlertPreferences.bind(alertsController));

// Mark alerts as read
router.post('/read', alertsController.markAlertsAsRead.bind(alertsController));

// Get unread alert count
router.get('/unread/count', alertsController.getUnreadAlertCount.bind(alertsController));

// Manually trigger market event processing (for testing/admin)
router.post('/process', alertsController.processMarketEvents.bind(alertsController));

export default router;
