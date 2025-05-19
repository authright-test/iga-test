import express from 'express';
import { createAppAuth } from '@octokit/auth-app';
import { checkPermission } from '../middleware/auth.js';
import logger from '../utils/logger.js';
import {
  getUserPermissions,
  checkPermission as checkPermissionService,
  checkMultiplePermissions
} from '../services/permissionService.js';

const router = express.Router();

// GitHub App Authentication
const auth = createAppAuth({
  appId: process.env.GITHUB_APP_ID,
  privateKey: process.env.GITHUB_APP_PRIVATE_KEY,
  clientId: process.env.GITHUB_APP_CLIENT_ID,
  clientSecret: process.env.GITHUB_APP_CLIENT_SECRET,
});

// Get user permissions
router.get('/user/:userId', checkPermission('view:permissions'), async (req, res) => {
  try {
    const { userId } = req.params;
    const permissions = await getUserPermissions(userId);
    res.json(permissions);
  } catch (error) {
    logger.error('Error fetching user permissions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Check single permission
router.get('/check/:permission', checkPermission('check:permissions'), async (req, res) => {
  try {
    const { permission } = req.params;
    const { organizationId } = req.query;
    const userId = req.user.id;

    const hasPermission = await checkPermissionService(userId, permission, organizationId);
    res.json({ hasPermission });
  } catch (error) {
    logger.error('Error checking permission:', error);
    res.status(500).json({ error: 'Failed to check permission' });
  }
});

// Check multiple permissions
router.post('/check-multiple', checkPermission('check:permissions'), async (req, res) => {
  try {
    const { permissions, organizationId } = req.body;
    const userId = req.user.id;

    const results = await checkMultiplePermissions(userId, permissions, organizationId);
    res.json(results);
  } catch (error) {
    logger.error('Error checking multiple permissions:', error);
    res.status(500).json({ error: 'Failed to check permissions' });
  }
});

export default router;
