import express from 'express';
import { checkPermission } from '../middleware/auth.js';
import { createAuditLog } from '../services/auditService.js';
import {
  getOrganizationUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserRoles,
  assignRoleToUser,
  removeRoleFromUser
} from '../services/userService.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * @route   GET /api/organizations/:organizationId/users
 * @desc    Get all users for current organization with pagination, search and sorting
 * @access  Private
 */
router.get('/organizations/:organizationId/users', 
    checkPermission('view:users'),
    async (req, res) => {
  try {
    const organizationId = req.params.organizationId;

    // Extract query parameters
    const page = parseInt(req.query.page) || 0;
    const size = parseInt(req.query.size) || 20;
    const searchKeyword = req.query.searchKeyword || '';
    const sort = req.query.sort || 'username,asc';

    // Validate parameters
    if (page < 0) {
      return res.status(400).json({ error: 'Page number must be non-negative' });
    }
    if (size < 1 || size > 100) {
      return res.status(400).json({ error: 'Page size must be between 1 and 100' });
    }
    if (!['username,asc', 'username,desc', 'email,asc', 'email,desc'].includes(sort)) {
      return res.status(400).json({ error: 'Invalid sort parameter' });
    }

    const users = await getOrganizationUsers(organizationId, {
      page,
      size,
      searchKeyword,
      sort
    });

    res.json(users);
  } catch (error) {
    logger.error('Error getting users:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/organizations/:organizationId/users
 * @desc    Create a new user
 * @access  Private
 */
router.post('/organizations/:organizationId/users', 
    checkPermission('create:users'), 
    async (req, res) => {
  try {
    const organizationId = req.params.organizationId;
    const { username, email, role, status } = req.body;

    if (!username || !email || !role) {
      return res.status(400).json({ error: 'Username, email, and role are required' });
    }

    const user = await createUser(
      { username, email, role, status },
      organizationId,
      req.user.id
    );

    res.status(201).json(user);
  } catch (error) {
    logger.error('Error creating user:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   PUT /api/organizations/:organizationId/users/:userId
 * @desc    Update a user
 * @access  Private
 */
router.put('/organizations/:organizationId/users/:userId', 
    checkPermission('update:users'), 
    async (req, res) => {
  try {
    const organizationId = req.params.organizationId;
    const { username, email, role, status } = req.body;

    const user = await updateUser(
      req.params.userId,
      { username, email, role, status },
      req.user.id
    );

    res.json(user);
  } catch (error) {
    logger.error('Error updating user:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   DELETE /api/organizations/:organizationId/users/:userId
 * @desc    Delete a user
 * @access  Private
 */
router.delete('/organizations/:organizationId/users/:userId', 
    checkPermission('delete:users'), 
    async (req, res) => {
  try {
    const organizationId = req.params.organizationId;
    const success = await deleteUser(req.params.userId, req.user.id);

    if (!success) {
      return res.status(400).json({ error: 'Failed to delete user' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    logger.error('Error deleting user:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/organizations/:organizationId/users/:userId/roles
 * @desc    Get user roles
 * @access  Private
 */
router.get('/organizations/:organizationId/users/:userId/roles', 
    checkPermission('view:users'), 
    async (req, res) => {
  try {
    const organizationId = req.params.organizationId;
    const roles = await getUserRoles(req.params.userId);
    res.json(roles);
  } catch (error) {
    logger.error('Error getting user roles:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/organizations/:organizationId/users/:userId/roles
 * @desc    Assign role to user
 * @access  Private
 */
router.post('/organizations/:organizationId/users/:userId/roles', 
    checkPermission('update:users'), 
    async (req, res) => {
  try {
    const organizationId = req.params.organizationId;
    const { roleId } = req.body;

    if (!roleId) {
      return res.status(400).json({ error: 'Role ID is required' });
    }

    const user = await assignRoleToUser(req.params.userId, roleId, req.user.id);
    res.json(user);
  } catch (error) {
    logger.error('Error assigning role to user:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   DELETE /api/organizations/:organizationId/users/:userId/roles/:roleId
 * @desc    Remove role from user
 * @access  Private
 */
router.delete('/organizations/:organizationId/users/:userId/roles/:roleId', 
    checkPermission('update:users'), 
    async (req, res) => {
  try {
    const organizationId = req.params.organizationId;
    const user = await removeRoleFromUser(req.params.userId, req.params.roleId, req.user.id);
    res.json(user);
  } catch (error) {
    logger.error('Error removing role from user:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router; 