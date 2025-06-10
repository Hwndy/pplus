import { Router } from 'express';
import {
  getDashboardSummary,
  getMentionsTrend,
  getSentimentAnalysis,
  getMediaChannelAnalysis,
  getCompanyComparison,
} from '../controllers/analyticsController';
import { requireAnyRole } from '../middleware/auth';

const router = Router();

// Get dashboard summary
router.get('/dashboard-summary', requireAnyRole, getDashboardSummary);

// Get mentions trend
router.get('/mentions-trend', requireAnyRole, getMentionsTrend);

// Get sentiment analysis
router.get('/sentiment-analysis', requireAnyRole, getSentimentAnalysis);

// Get media channel analysis
router.get('/media-channel-analysis', requireAnyRole, getMediaChannelAnalysis);

// Get company comparison
router.get('/company-comparison', requireAnyRole, getCompanyComparison);

export default router;
