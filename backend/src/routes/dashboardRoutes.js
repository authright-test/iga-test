import express from 'express';
import { authenticateJWT } from '../middleware/auth.js';
import logger from '../utils/logger.js';
import { getDashboardData } from '../services/dashboardService.js';

const router = express.Router();

// Get dashboard data
router.get('/:organizationId', authenticateJWT, async (req, res) => {
  try {
    const { organizationId } = req.params;
    const data = await getDashboardData(organizationId);
    res.json(data);
  } catch (error) {
    logger.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router; 