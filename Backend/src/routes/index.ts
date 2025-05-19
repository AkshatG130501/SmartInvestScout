import { Router } from 'express';
import { healthCheckRouter } from './healthCheck';
import { insightsRouter } from './insights';

const router = Router();

// Health check route
router.use('/health', healthCheckRouter);

// Insights routes
router.use('/insights', insightsRouter);
export default router;
