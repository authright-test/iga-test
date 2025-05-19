import express from 'express';
import { getGitHubApp, listInstallations, getInstallation } from '../utils/github.js';
import { checkPermission } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * @route   GET /api/installations
 * @desc    Get all installations for the GitHub App
 * @access  Private
 */
router.get('/', checkPermission('installations.view'), async (req, res) => {
  try {
    const installations = await listInstallations();
    res.json(installations);
  } catch (error) {
    logger.error('Error fetching installations:', error);
    res.status(500).json({ error: 'Failed to fetch installations' });
  }
});

/**
 * @route   GET /api/installations/:installationId
 * @desc    Get installation details
 * @access  Private
 */
router.get('/:installationId', checkPermission('installations.view'), async (req, res) => {
  try {
    const { installationId } = req.params;
    const installation = await getInstallation(installationId);
    res.json(installation);
  } catch (error) {
    logger.error('Error fetching installation:', error);
    res.status(500).json({ error: 'Failed to fetch installation' });
  }
});

/**
 * @route   GET /api/installations/install
 * @desc    Redirect to GitHub App installation page
 * @access  Public
 */
router.get('/install', (req, res) => {
  const githubAppId = process.env.GITHUB_APP_ID;
  const redirectUrl = encodeURIComponent(process.env.GITHUB_CALLBACK_URL);
  const installUrl = `https://github.com/apps/${githubAppId}/installations/new?redirect_url=${redirectUrl}`;
  res.redirect(installUrl);
});

export default router; 