import { Router } from 'express';
import {
  exportCompanies,
  exportEditorials,
  exportAnalytics,
} from '../controllers/exportController';
import { requireAnalystOrAbove } from '../middleware/auth';

const router = Router();

// Export companies data
router.get('/companies', requireAnalystOrAbove, exportCompanies);

// Export editorials data
router.get('/editorials', requireAnalystOrAbove, exportEditorials);

// Export analytics data
router.get('/analytics', requireAnalystOrAbove, exportAnalytics);

export default router;
