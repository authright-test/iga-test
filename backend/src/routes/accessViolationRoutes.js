import express from 'express';
import { Octokit } from '@octokit/rest';
import { createAppAuth } from '@octokit/auth-app';
import { checkPermission } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

// GitHub App Authentication
const auth = createAppAuth({
  appId: process.env.GITHUB_APP_ID,
  privateKey: process.env.GITHUB_APP_PRIVATE_KEY,
  clientId: process.env.GITHUB_APP_CLIENT_ID,
  clientSecret: process.env.GITHUB_APP_CLIENT_SECRET,
});

// Get all access violations
router.get('/', checkPermission('violations.view'), async (req, res) => {
  try {
    const octokit = new Octokit({ auth });
    const { data: violations } = await octokit.issues.listForRepo({
      owner: req.query.organization,
      repo: 'access-violations',
      labels: ['access-violation'],
      state: 'all',
    });
    res.json(violations);
  } catch (error) {
    logger.error('Error fetching access violations:', error);
    res.status(500).json({ error: 'Failed to fetch access violations' });
  }
});

// Get single access violation
router.get('/:violationId', checkPermission('violations.view'), async (req, res) => {
  try {
    const octokit = new Octokit({ auth });
    const { data: violation } = await octokit.issues.get({
      owner: req.query.organization,
      repo: 'access-violations',
      issue_number: req.params.violationId,
    });
    res.json(violation);
  } catch (error) {
    logger.error('Error fetching access violation:', error);
    res.status(500).json({ error: 'Failed to fetch access violation' });
  }
});

// Create access violation
router.post('/', checkPermission('violations.create'), async (req, res) => {
  try {
    const octokit = new Octokit({ auth });
    const { data: violation } = await octokit.issues.create({
      owner: req.query.organization,
      repo: 'access-violations',
      title: `Access Violation: ${req.body.title}`,
      body: req.body.description,
      labels: ['access-violation', req.body.severity || 'medium'],
    });
    res.status(201).json(violation);
  } catch (error) {
    logger.error('Error creating access violation:', error);
    res.status(500).json({ error: 'Failed to create access violation' });
  }
});

// Update access violation
router.put('/:violationId', checkPermission('violations.edit'), async (req, res) => {
  try {
    const octokit = new Octokit({ auth });
    const { data: violation } = await octokit.issues.update({
      owner: req.query.organization,
      repo: 'access-violations',
      issue_number: req.params.violationId,
      title: req.body.title,
      body: req.body.description,
      state: req.body.state,
    });
    res.json(violation);
  } catch (error) {
    logger.error('Error updating access violation:', error);
    res.status(500).json({ error: 'Failed to update access violation' });
  }
});

// Add violation comment
router.post('/:violationId/comments', checkPermission('violations.comment'), async (req, res) => {
  try {
    const octokit = new Octokit({ auth });
    const { data: comment } = await octokit.issues.createComment({
      owner: req.query.organization,
      repo: 'access-violations',
      issue_number: req.params.violationId,
      body: req.body.comment,
    });
    res.status(201).json(comment);
  } catch (error) {
    logger.error('Error adding violation comment:', error);
    res.status(500).json({ error: 'Failed to add violation comment' });
  }
});

// Get violation statistics
router.get('/stats/summary', checkPermission('violations.view'), async (req, res) => {
  try {
    const octokit = new Octokit({ auth });
    const { data: violations } = await octokit.issues.listForRepo({
      owner: req.query.organization,
      repo: 'access-violations',
      labels: ['access-violation'],
      state: 'all',
    });

    const stats = {
      total: violations.length,
      open: violations.filter(v => v.state === 'open').length,
      closed: violations.filter(v => v.state === 'closed').length,
      bySeverity: {
        high: violations.filter(v => v.labels.some(l => l.name === 'high')).length,
        medium: violations.filter(v => v.labels.some(l => l.name === 'medium')).length,
        low: violations.filter(v => v.labels.some(l => l.name === 'low')).length,
      },
    };

    res.json(stats);
  } catch (error) {
    logger.error('Error fetching violation stats:', error);
    res.status(500).json({ error: 'Failed to fetch violation stats' });
  }
});

// Get violation trends
router.get('/stats/trends', checkPermission('violations.view'), async (req, res) => {
  try {
    const octokit = new Octokit({ auth });
    const { data: violations } = await octokit.issues.listForRepo({
      owner: req.query.organization,
      repo: 'access-violations',
      labels: ['access-violation'],
      state: 'all',
    });

    // Group statistics by date
    const trends = violations.reduce((acc, violation) => {
      const date = violation.created_at.split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          total: 0,
          open: 0,
          closed: 0,
        };
      }
      acc[date].total++;
      if (violation.state === 'open') {
        acc[date].open++;
      } else {
        acc[date].closed++;
      }
      return acc;
    }, {});

    res.json(trends);
  } catch (error) {
    logger.error('Error fetching violation trends:', error);
    res.status(500).json({ error: 'Failed to fetch violation trends' });
  }
});

export default router;
