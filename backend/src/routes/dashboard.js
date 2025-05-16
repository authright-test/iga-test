import express from 'express';
import { authenticateJWT } from '../middleware/auth.js';
import logger from '../utils/logger.js';
import { getDashboardStats, getRecentActivities } from '../services/dashboard.js';

const router = express.Router();

// Get dashboard statistics
router.get('/stats/:organizationId', authenticateJWT, async (req, res) => {
  try {
    const { organizationId } = req.params;
    const stats = await getDashboardStats(organizationId);
    res.json(stats);
  } catch (error) {
    logger.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get recent activities
router.get('/activities/:organizationId', authenticateJWT, async (req, res) => {
  try {
    const { organizationId } = req.params;
    const activities = await getRecentActivities(organizationId);
    res.json(activities);
  } catch (error) {
    logger.error('Error fetching recent activities:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router; 