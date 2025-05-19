import { Router } from 'express';
import { healthCheckRouter } from './healthCheck';

const router = Router();

// Health check route
router.use('/health', healthCheckRouter);


export default router; 