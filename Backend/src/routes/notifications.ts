import { Router } from 'express';
import { NotificationsController } from '../controllers/notificationsController';

const router = Router();
const notificationsController = NotificationsController.getInstance();

/**
 * Subscribe to pricing notifications
 * POST /api/notifications/pricing/subscribe
 */
router.post(
  '/pricing/subscribe',
  notificationsController.subscribeToPricing.bind(notificationsController)
);

/**
 * Unsubscribe from pricing notifications
 * GET /api/notifications/pricing/unsubscribe
 */
router.get(
  '/pricing/unsubscribe',
  notificationsController.unsubscribeFromPricing.bind(notificationsController)
);

export default router;
