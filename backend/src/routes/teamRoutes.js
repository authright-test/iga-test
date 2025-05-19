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

// Get all teams
router.get('/', checkPermission('teams.view'), async (req, res) => {
  try {
    const octokit = new Octokit({ auth });
    const { data: teams } = await octokit.teams.list({
      org: req.query.organization,
    });
    res.json(teams);
  } catch (error) {
    logger.error('Error fetching teams:', error);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

// Get single team
router.get('/:teamId', checkPermission('teams.view'), async (req, res) => {
  try {
    const octokit = new Octokit({ auth });
    const { data: team } = await octokit.teams.get({
      org: req.query.organization,
      team_slug: req.params.teamId,
    });
    res.json(team);
  } catch (error) {
    logger.error('Error fetching team:', error);
    res.status(500).json({ error: 'Failed to fetch team' });
  }
});

// Create team
router.post('/', checkPermission('teams.create'), async (req, res) => {
  try {
    const octokit = new Octokit({ auth });
    const { data: team } = await octokit.teams.create({
      org: req.body.organization,
      name: req.body.name,
      description: req.body.description,
      privacy: req.body.privacy || 'secret',
    });
    res.status(201).json(team);
  } catch (error) {
    logger.error('Error creating team:', error);
    res.status(500).json({ error: 'Failed to create team' });
  }
});

// Update team
router.put('/:teamId', checkPermission('teams.edit'), async (req, res) => {
  try {
    const octokit = new Octokit({ auth });
    const { data: team } = await octokit.teams.update({
      org: req.query.organization,
      team_slug: req.params.teamId,
      name: req.body.name,
      description: req.body.description,
      privacy: req.body.privacy,
    });
    res.json(team);
  } catch (error) {
    logger.error('Error updating team:', error);
    res.status(500).json({ error: 'Failed to update team' });
  }
});

// Delete team
router.delete('/:teamId', checkPermission('teams.delete'), async (req, res) => {
  try {
    const octokit = new Octokit({ auth });
    await octokit.teams.delete({
      org: req.query.organization,
      team_slug: req.params.teamId,
    });
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting team:', error);
    res.status(500).json({ error: 'Failed to delete team' });
  }
});

// Get team members
router.get('/:teamId/members', checkPermission('teams.view'), async (req, res) => {
  try {
    const octokit = new Octokit({ auth });
    const { data: members } = await octokit.teams.listMembers({
      org: req.query.organization,
      team_slug: req.params.teamId,
    });
    res.json(members);
  } catch (error) {
    logger.error('Error fetching team members:', error);
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
});

// Add team member
router.post('/:teamId/members', checkPermission('teams.edit'), async (req, res) => {
  try {
    const octokit = new Octokit({ auth });
    await octokit.teams.addOrUpdateMembershipForUserInOrg({
      org: req.query.organization,
      team_slug: req.params.teamId,
      username: req.body.username,
      role: req.body.role || 'member',
    });
    res.status(201).json({ message: 'Member added successfully' });
  } catch (error) {
    logger.error('Error adding team member:', error);
    res.status(500).json({ error: 'Failed to add team member' });
  }
});

// Remove team member
router.delete('/:teamId/members/:username', checkPermission('teams.edit'), async (req, res) => {
  try {
    const octokit = new Octokit({ auth });
    await octokit.teams.removeMembershipForUserInOrg({
      org: req.query.organization,
      team_slug: req.params.teamId,
      username: req.params.username,
    });
    res.status(204).send();
  } catch (error) {
    logger.error('Error removing team member:', error);
    res.status(500).json({ error: 'Failed to remove team member' });
  }
});

// Sync teams
router.post('/sync', checkPermission('teams.sync'), async (req, res) => {
  try {
    const octokit = new Octokit({ auth });
    const { data: teams } = await octokit.teams.list({
      org: req.query.organization,
    });

    // Add local database sync logic here

    res.json({ message: 'Teams synchronized successfully', teams });
  } catch (error) {
    logger.error('Error synchronizing teams:', error);
    res.status(500).json({ error: 'Failed to synchronize teams' });
  }
});

export default router;
