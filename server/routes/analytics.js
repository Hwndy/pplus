const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const AnalyticsController = require('../controllers/analyticsController');

router.get('/media', authenticateToken, authorizeRole(['admin', 'analyst']), AnalyticsController.getMediaAnalytics);
router.get('/export', authenticateToken, authorizeRole(['admin', 'analyst']), AnalyticsController.exportAnalytics);

module.exports = router;