import { Router } from 'express';
import bibleRoutes from './bible.routes';

const router = Router();

// Version 1 of the Bible API
router.use('/v1', bibleRoutes);

// Health check endpoint
router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Jerusalem Bible API'
  });
});


export default router;
