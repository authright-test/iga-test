import express from 'express';
import { authenticateJWT } from '../middleware/auth.js';
import logger from '../utils/logger.js';
import { 
  getUserPermissions,
  checkPermission,
  checkMultiplePermissions
} from '../services/permissions.js';

const router = express.Router();

// Get user permissions
router.get('/user/:userId', authenticateJWT, async (req, res) => {
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
router.post('/check', authenticateJWT, async (req, res) => {
  try {
    const { userId, permissionName, resource } = req.body;
    const hasPermission = await checkPermission(userId, permissionName, resource);
    res.json({ hasPermission });
  } catch (error) {
    logger.error('Error checking permission:', error);
    res.status(500).json({ error: error.message });
  }
});

// Check multiple permissions
router.post('/check-multiple', authenticateJWT, async (req, res) => {
  try {
    const { userId, permissions } = req.body;
    const results = await checkMultiplePermissions(userId, permissions);
    res.json({ permissions: results });
  } catch (error) {
    logger.error('Error checking multiple permissions:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router; 