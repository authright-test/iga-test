import express from 'express';
import { authenticateGitHubApp, authenticateJWT } from '../middleware/auth.js';
import logger from '../utils/logger.js';
import auditRoutes from './auditRoutes.js';
import authRoutes from './authRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import permissionRoutes from './permissionRoutes.js';
import policyRoutes from './policyRoutes.js';
import roleRoutes from './roleRoutes.js';
import userRoutes from './userRoutes.js';
import repositoryRoutes from './repositoryRoutes.js';
import organizationRoutes from './organizationRoutes.js';
import installationRoutes from './installationRoutes.js';

function setupRoutes(app) {
  const router = express.Router();

  // Health check endpoint
  router.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Auth routes (public)
  router.use('/auth', authRoutes);

  // Installation routes (public)
  router.use('/installations', installationRoutes);

  // Protected routes
  router.use('/api', authenticateJWT);
  router.use('/api/github', authenticateGitHubApp);
  
  // API routes
  router.use('/api/roles', roleRoutes);
  router.use('/api/users', userRoutes);
  router.use('/api/policies', policyRoutes);
  router.use('/api/audit', auditRoutes);
  router.use('/api/dashboard', dashboardRoutes);
  router.use('/api/permissions', permissionRoutes);
  router.use('/api/repositories', repositoryRoutes);
  router.use('/api/organizations', organizationRoutes);
  router.use('/api/installations', installationRoutes);

  app.use(router);
}

export { setupRoutes };
