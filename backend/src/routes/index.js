import express from 'express';
import { authenticateGitHubApp, authenticateJWT } from '../middleware/auth.js';
import logger from '../utils/logger.js';
import auditRoutes from './audit.js';
import authRoutes from './auth.js';
import dashboardRoutes from './dashboard.js';
import permissionsRoutes from './permissions.js';
import policiesRoutes from './policies.js';
import rolesRoutes from './roles.js';

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
  router.use('/api/roles', rolesRoutes);
  router.use('/api/policies', policiesRoutes);
  router.use('/api/audit', auditRoutes);
  router.use('/api/dashboard', dashboardRoutes);
  router.use('/api/permissions', permissionsRoutes);

  // Organization routes
  router.get('/api/organizations', async (req, res) => {
    try {
      const { data } = await req.github.orgs.get({
        org: req.query.org
      });
      res.json(data);
    } catch (error) {
      logger.error('Error fetching organization:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Member routes
  router.get('/api/organizations/:org/members', async (req, res) => {
    try {
      const { data } = await req.github.orgs.listMembers({
        org: req.params.org
      });
      res.json(data);
    } catch (error) {
      logger.error('Error fetching organization members:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Repository routes
  router.get('/api/organizations/:org/repositories', async (req, res) => {
    try {
      const { data } = await req.github.repos.listForOrg({
        org: req.params.org
      });
      res.json(data);
    } catch (error) {
      logger.error('Error fetching organization repositories:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Team routes
  router.get('/api/organizations/:org/teams', async (req, res) => {
    try {
      const { data } = await req.github.teams.list({
        org: req.params.org
      });
      res.json(data);
    } catch (error) {
      logger.error('Error fetching organization teams:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.use(router);
}

export { setupRoutes };
