import express from 'express';
import { checkPermission } from '../middleware/auth.js';
import { createAuditLog } from '../services/auditService.js';
import {
  getOrganization,
  getOrganizations,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  getOrganizationMembers,
  updateOrganizationMembers,
  getOrganizationTeams,
  updateOrganizationTeams
} from '../services/organizationService.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * @route   GET /api/organizations
 * @desc    Get all organizations with pagination, search and sorting
 * @access  Private
 */
router.get('/', checkPermission('view:organizations'), async (req, res) => {
  try {
    // Extract query parameters
    const page = parseInt(req.query.page) || 0;
    const size = parseInt(req.query.size) || 20;
    const searchKeyword = req.query.searchKeyword || '';
    const sort = req.query.sort || 'name,asc';

    // Validate parameters
    if (page < 0) {
      return res.status(400).json({ error: 'Page number must be non-negative' });
    }
    if (size < 1 || size > 100) {
      return res.status(400).json({ error: 'Page size must be between 1 and 100' });
    }
    if (!['name,asc', 'name,desc', 'email,asc', 'email,desc'].includes(sort)) {
      return res.status(400).json({ error: 'Invalid sort parameter' });
    }

    const organizations = await getOrganizations({
      page,
      size,
      searchKeyword,
      sort
    });

    res.json(organizations);
  } catch (error) {
    logger.error('Error getting organizations:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/organizations/:id
 * @desc    Get organization by ID
 * @access  Private
 */
router.get('/:id', checkPermission('view:organizations'), async (req, res) => {
  try {
    const organization = await getOrganization(req.params.id);
    res.json(organization);
  } catch (error) {
    logger.error('Error fetching organization:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/organizations
 * @desc    Create a new organization
 * @access  Private
 */
router.post('/', checkPermission('create:organizations'), async (req, res) => {
  try {
    const { name, description, website, location, email, plan, status } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const organization = await createOrganization(
      { name, description, website, location, email, plan, status },
      req.user.id
    );

    res.status(201).json(organization);
  } catch (error) {
    logger.error('Error creating organization:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   PUT /api/organizations/:id
 * @desc    Update an organization
 * @access  Private
 */
router.put('/:id', checkPermission('update:organizations'), async (req, res) => {
  try {
    const { name, description, website, location, email, plan, status } = req.body;

    const organization = await updateOrganization(
      req.params.id,
      { name, description, website, location, email, plan, status },
      req.user.id
    );

    res.json(organization);
  } catch (error) {
    logger.error('Error updating organization:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   DELETE /api/organizations/:id
 * @desc    Delete an organization
 * @access  Private
 */
router.delete('/:id', checkPermission('delete:organizations'), async (req, res) => {
  try {
    const success = await deleteOrganization(req.params.id, req.user.id);

    if (!success) {
      return res.status(400).json({ error: 'Failed to delete organization' });
    }

    res.json({ message: 'Organization deleted successfully' });
  } catch (error) {
    logger.error('Error deleting organization:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/organizations/:id/members
 * @desc    Get organization members
 * @access  Private
 */
router.get('/:id/members', checkPermission('view:organizations'), async (req, res) => {
  try {
    const members = await getOrganizationMembers(req.params.id);
    res.json(members);
  } catch (error) {
    logger.error('Error fetching organization members:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   PUT /api/organizations/:id/members
 * @desc    Update organization members
 * @access  Private
 */
router.put('/:id/members', checkPermission('update:organizations'), async (req, res) => {
  try {
    const { members } = req.body;

    if (!Array.isArray(members)) {
      return res.status(400).json({ error: 'Members must be an array' });
    }

    const updatedMembers = await updateOrganizationMembers(
      req.params.id,
      members,
      req.user.id
    );

    res.json(updatedMembers);
  } catch (error) {
    logger.error('Error updating organization members:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/organizations/:id/teams
 * @desc    Get organization teams
 * @access  Private
 */
router.get('/:id/teams', checkPermission('view:organizations'), async (req, res) => {
  try {
    const teams = await getOrganizationTeams(req.params.id);
    res.json(teams);
  } catch (error) {
    logger.error('Error fetching organization teams:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   PUT /api/organizations/:id/teams
 * @desc    Update organization teams
 * @access  Private
 */
router.put('/:id/teams', checkPermission('update:organizations'), async (req, res) => {
  try {
    const { teams } = req.body;

    if (!Array.isArray(teams)) {
      return res.status(400).json({ error: 'Teams must be an array' });
    }

    const updatedTeams = await updateOrganizationTeams(
      req.params.id,
      teams,
      req.user.id
    );

    res.json(updatedTeams);
  } catch (error) {
    logger.error('Error updating organization teams:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router; 