import { Router } from 'express';
import { InsightsController } from '../controllers/insightsController';

const router = Router();
const insightsController = InsightsController.getInstance();

// Get insights for a stock
router.get('/:stock_name', insightsController.getStockInsights.bind(insightsController));

export default router;
