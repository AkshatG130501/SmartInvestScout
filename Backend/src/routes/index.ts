import { Router } from 'express';
import { healthCheckRouter } from './healthCheck';
import { insightsRouter } from './insights';
import { documentsRouter } from './documents';
import { profilesRouter } from './profiles';
import { chatRouter } from './chat';
import { conversationsRouter } from './conversations';
import { searchRouter } from './search';

const router = Router();

// Health check route
router.use('/health', healthCheckRouter);

// Insights routes
router.use('/insights', insightsRouter);

// Documents routes
router.use('/documents', documentsRouter);

// User profiles routes
router.use('/profiles', profilesRouter);

// Chat routes
router.use('/chat', chatRouter);

// Conversations routes
router.use('/conversations', conversationsRouter);

// Search routes
router.use('/search', searchRouter);

export default router;
