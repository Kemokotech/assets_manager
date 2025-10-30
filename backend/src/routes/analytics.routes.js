const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAssetStats,
  getDepartmentStats,
  getActivityTimeline,
  getAssetTrends
} = require('../controllers/analytics.controller');
const { authenticateToken } = require('../middleware/auth');

// All authenticated users can view analytics
router.get('/dashboard', authenticateToken, getDashboardStats);
router.get('/assets', authenticateToken, getAssetStats);
router.get('/departments', authenticateToken, getDepartmentStats);
router.get('/activity', authenticateToken, getActivityTimeline);
router.get('/trends', authenticateToken, getAssetTrends);

module.exports = router;
