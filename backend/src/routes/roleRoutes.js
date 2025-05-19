import { createAppAuth } from '@octokit/auth-app';
import express from 'express';
import { checkPermission } from '../middleware/auth.js';
import { Organization, Permission, Role } from '../models/index.js';
import { addPermissionToRole, hasPermission, removePermissionFromRole } from '../services/accessControlService.js';
import { createAuditLog } from '../services/auditService.js';
import { createRole, deleteRole, getOrganizationRoles, updateRole } from '../services/roleService.js';
import logger from '../utils/logger.js';

const router = express.Router();

// GitHub App Authentication
const auth = createAppAuth({
  appId: process.env.GITHUB_APP_ID,
  privateKey: process.env.GITHUB_APP_PRIVATE_KEY,
  clientId: process.env.GITHUB_APP_CLIENT_ID,
  clientSecret: process.env.GITHUB_APP_CLIENT_SECRET,
});

/**
 * @route   GET /api/roles
 * @desc    Get all roles for current organization
 * @access  Private
 */
router.get('/', checkPermission('view:roles'), async (req, res) => {
  try {
    const organizationId = req.query.organizationId;

    if (!organizationId) {
      return res.status(400).json({ error: 'Organization ID is required' });
    }

    const roles = await getOrganizationRoles(organizationId);

    res.json(roles);
  } catch (error) {
    logger.error('Error getting roles:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/roles/:id
 * @desc    Get role by ID
 * @access  Private
 */
router.get('/:id', checkPermission('view:roles'), async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id, {
      include: [Organization]
    });

    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    res.json(role);
  } catch (error) {
    logger.error('Error getting role:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/roles
 * @desc    Create a new role
 * @access  Private
 */
router.post('/', checkPermission('create:roles'), async (req, res) => {
  try {
    const { name, description, permissions, organizationId } = req.body;

    if (!name || !permissions || !organizationId) {
      return res.status(400).json({ error: 'Name, permissions, and organization ID are required' });
    }

    const role = await createRole(
      { name, description, permissions },
      organizationId,
      req.user.id
    );

    res.status(201).json(role);
  } catch (error) {
    logger.error('Error creating role:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   PUT /api/roles/:id
 * @desc    Update a role
 * @access  Private
 */
router.put('/:id', checkPermission('update:roles'), async (req, res) => {
  try {
    const { name, description, permissions } = req.body;

    const role = await updateRole(
      req.params.id,
      { name, description, permissions },
      req.user.id
    );

    res.json(role);
  } catch (error) {
    logger.error('Error updating role:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   DELETE /api/roles/:id
 * @desc    Delete a role
 * @access  Private
 */
router.delete('/:id', checkPermission('delete:roles'), async (req, res) => {
  try {
    const success = await deleteRole(req.params.id, req.user.id);

    if (!success) {
      return res.status(400).json({ error: 'Failed to delete role' });
    }

    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    logger.error('Error deleting role:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/roles/:id/assign
 * @desc    Assign role to users
 * @access  Private
 */
router.post('/:id/assign', checkPermission('update:roles'), async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds)) {
      return res.status(400).json({ error: 'User IDs array is required' });
    }

    const role = await Role.findByPk(req.params.id);

    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    // Assign role to users
    await role.addUsers(userIds);

    // Audit log
    await createAuditLog({
      action: 'role_assigned',
      resourceType: 'role',
      resourceId: role.id.toString(),
      details: {
        roleName: role.name,
        userIds
      },
      userId: req.user.id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({ message: 'Role assigned successfully' });
  } catch (error) {
    logger.error('Error assigning role:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/roles/:id/unassign
 * @desc    Unassign role from users
 * @access  Private
 */
router.post('/:id/unassign', checkPermission('update:roles'), async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds)) {
      return res.status(400).json({ error: 'User IDs array is required' });
    }

    const role = await Role.findByPk(req.params.id);

    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    // Unassign role from users
    await role.removeUsers(userIds);

    // Audit log
    await createAuditLog({
      action: 'role_unassigned',
      resourceType: 'role',
      resourceId: role.id.toString(),
      details: {
        roleName: role.name,
        userIds
      },
      userId: req.user.id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({ message: 'Role unassigned successfully' });
  } catch (error) {
    logger.error('Error unassigning role:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/roles/:id/permissions
 * @desc    Add permissions to a role
 * @access  Private
 */
router.post('/:id/permissions', async (req, res) => {
  try {
    // Check if user has permission to update roles
    const hasUpdatePermission = await hasPermission(req.user.id, 'update:roles');

    if (!hasUpdatePermission) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    const { permissionIds } = req.body;

    if (!permissionIds || !Array.isArray(permissionIds)) {
      return res.status(400).json({ error: 'Permission IDs array is required' });
    }

    const role = await Role.findByPk(req.params.id);

    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    // Add permissions
    const addedPermissions = [];
    for (const permissionId of permissionIds) {
      const success = await addPermissionToRole(role.id, permissionId);
      if (success) {
        addedPermissions.push(permissionId);
      }
    }

    // Audit log
    await createAuditLog({
      action: 'permissions_added_to_role',
      resourceType: 'role',
      resourceId: role.id.toString(),
      details: {
        roleName: role.name,
        permissionIds: addedPermissions
      },
      userId: req.user.id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    // Get updated role with permissions
    const updatedRole = await Role.findByPk(req.params.id, {
      include: [Permission]
    });

    res.json(updatedRole);
  } catch (error) {
    logger.error('Error adding permissions to role:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   DELETE /api/roles/:id/permissions/:permissionId
 * @desc    Remove a permission from a role
 * @access  Private
 */
router.delete('/:id/permissions/:permissionId', async (req, res) => {
  try {
    // Check if user has permission to update roles
    const hasUpdatePermission = await hasPermission(req.user.id, 'update:roles');

    if (!hasUpdatePermission) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    const role = await Role.findByPk(req.params.id);

    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    const permission = await Permission.findByPk(req.params.permissionId);

    if (!permission) {
      return res.status(404).json({ error: 'Permission not found' });
    }

    // Remove permission
    const success = await removePermissionFromRole(role.id, permission.id);

    if (!success) {
      return res.status(400).json({ error: 'Failed to remove permission from role' });
    }

    // Audit log
    await createAuditLog({
      action: 'permission_removed_from_role',
      resourceType: 'role',
      resourceId: role.id.toString(),
      details: {
        roleName: role.name,
        permissionName: permission.name,
        permissionId: permission.id
      },
      userId: req.user.id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({ message: 'Permission removed from role successfully' });
  } catch (error) {
    logger.error('Error removing permission from role:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
