import express from 'express';
import { createAppAuth } from '@octokit/auth-app';
import { checkPermission } from '../middleware/auth.js';
import logger from '../utils/logger.js';
import { getDashboardData } from '../services/dashboardService.js';

const router = express.Router();

// GitHub App Authentication
const auth = createAppAuth({
  appId: process.env.GITHUB_APP_ID,
  privateKey: process.env.GITHUB_APP_PRIVATE_KEY,
  clientId: process.env.GITHUB_APP_CLIENT_ID,
  clientSecret: process.env.GITHUB_APP_CLIENT_SECRET,
});

// Get dashboard data
router.get('/:organizationId', checkPermission('view:dashboard'), async (req, res) => {
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
