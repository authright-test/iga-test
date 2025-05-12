const express = require('express');
const githubAuthMiddleware = require('../middleware/githubAuth');
const authRoutes = require('./auth');
const rolesRoutes = require('./roles');
const policiesRoutes = require('./policies');
const auditRoutes = require('./audit');
const logger = require('../utils/logger');

function setupRoutes(app) {
  const router = express.Router();

  // Health check endpoint
  router.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Auth routes (public)
  router.use('/auth', authRoutes);

  // Protected routes
  router.use('/api', githubAuthMiddleware, (req, res, next) => {
    // Add user data from token to req object
    req.user = {
      id: req.decoded.userId,
      githubId: req.decoded.githubId,
      username: req.decoded.username
    };
    next();
  });

  // API routes (protected)
  router.use('/api/roles', rolesRoutes);
  router.use('/api/policies', policiesRoutes);
  router.use('/api/audit', auditRoutes);

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

module.exports = {
  setupRoutes
}; 