import express from 'express';
import { authenticateGitHubApp, authenticateJWT } from '../middleware/auth.js';
import logger from '../utils/logger.js';
import auditRoutes from './auditRoutes.js';
import authRoutes from './authRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import permissionRoutes from './permissionRoutes.js';
import policyRoutes from './policyRoutes.js';
import roleRoutes from './roleRoutes.js';
import repositoryRoutes from './repositoryRoutes.js';
import { getOrganization, getOrganizationMembers, getOrganizationTeams } from '../services/organizationService.js';

function setupRoutes(app) {
  const router = express.Router();

  // Health check endpoint
  router.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Auth routes (public)
  router.use('/auth', authRoutes);

  // Protected routes
  router.use('/api', authenticateJWT);

  // GitHub App routes
  router.use('/api/github', authenticateGitHubApp);

  // API routes (protected)
  router.use('/api/roles', roleRoutes);
  router.use('/api/policies', policyRoutes);
  router.use('/api/audit', auditRoutes);
  router.use('/api/dashboard', dashboardRoutes);
  router.use('/api/permissions', permissionRoutes);
  router.use('/api/repositories', repositoryRoutes);

  // Organization routes
  router.get('/api/organizations/:org', async (req, res) => {
    try {
      const organization = await getOrganization(req.params.org);
      res.json(organization);
    } catch (error) {
      logger.error('Error fetching organization:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Member routes
  router.get('/api/organizations/:org/members', async (req, res) => {
    try {
      const members = await getOrganizationMembers(req.params.org);
      res.json(members);
    } catch (error) {
      logger.error('Error fetching organization members:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Team routes
  router.get('/api/organizations/:org/teams', async (req, res) => {
    try {
      const teams = await getOrganizationTeams(req.params.org);
      res.json(teams);
    } catch (error) {
      logger.error('Error fetching organization teams:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.use(router);
}

export { setupRoutes };
