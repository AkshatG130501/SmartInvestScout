import { Router } from 'express';
import { healthCheckRouter } from './healthCheck';
import { insightsRouter } from './insights';
import { documentsRouter } from './documents';

const router = Router();

// Health check route
router.use('/health', healthCheckRouter);

// Insights routes
router.use('/insights', insightsRouter);

// Documents routes
router.use('/documents', documentsRouter);

export default router;
