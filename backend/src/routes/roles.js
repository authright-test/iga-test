const express = require('express');
const { Role, Permission, User } = require('../models');
const { hasPermission, assignRoleToUser, removeRoleFromUser, getUserRoles, addPermissionToRole, removePermissionFromRole } = require('../services/accessControlService');
const { createAuditLog } = require('../services/auditService');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * @route   GET /api/roles
 * @desc    Get all roles
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    // Check if user has permission to view roles
    const hasViewPermission = await hasPermission(req.user.id, 'view:roles');
    
    if (!hasViewPermission) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    
    const roles = await Role.findAll({
      include: [Permission]
    });
    
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
router.get('/:id', async (req, res) => {
  try {
    // Check if user has permission to view roles
    const hasViewPermission = await hasPermission(req.user.id, 'view:roles');
    
    if (!hasViewPermission) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    
    const role = await Role.findByPk(req.params.id, {
      include: [
        {
          model: Permission
        },
        {
          model: User,
          attributes: ['id', 'username', 'email', 'avatarUrl']
        }
      ]
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
router.post('/', async (req, res) => {
  try {
    // Check if user has permission to create roles
    const hasCreatePermission = await hasPermission(req.user.id, 'create:roles');
    
    if (!hasCreatePermission) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    
    const { name, description, isSystem = false } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Role name is required' });
    }
    
    const role = await Role.create({
      name,
      description,
      isSystem
    });
    
    // Audit log
    await createAuditLog({
      action: 'role_created',
      resourceType: 'role',
      resourceId: role.id.toString(),
      details: {
        roleName: role.name
      },
      userId: req.user.id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });
    
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
router.put('/:id', async (req, res) => {
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
    
    // Don't allow modifying system roles
    if (role.isSystem) {
      return res.status(403).json({ error: 'System roles cannot be modified' });
    }
    
    const { name, description } = req.body;
    
    if (name) {
      role.name = name;
    }
    
    if (description !== undefined) {
      role.description = description;
    }
    
    await role.save();
    
    // Audit log
    await createAuditLog({
      action: 'role_updated',
      resourceType: 'role',
      resourceId: role.id.toString(),
      details: {
        roleName: role.name,
        changes: req.body
      },
      userId: req.user.id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });
    
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
router.delete('/:id', async (req, res) => {
  try {
    // Check if user has permission to delete roles
    const hasDeletePermission = await hasPermission(req.user.id, 'delete:roles');
    
    if (!hasDeletePermission) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    
    const role = await Role.findByPk(req.params.id);
    
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }
    
    // Don't allow deleting system roles
    if (role.isSystem) {
      return res.status(403).json({ error: 'System roles cannot be deleted' });
    }
    
    const roleName = role.name;
    const roleId = role.id;
    
    await role.destroy();
    
    // Audit log
    await createAuditLog({
      action: 'role_deleted',
      resourceType: 'role',
      resourceId: roleId.toString(),
      details: {
        roleName
      },
      userId: req.user.id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });
    
    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    logger.error('Error deleting role:', error);
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

/**
 * @route   POST /api/roles/:id/users
 * @desc    Assign role to users
 * @access  Private
 */
router.post('/:id/users', async (req, res) => {
  try {
    // Check if user has permission to assign roles
    const hasAssignPermission = await hasPermission(req.user.id, 'assign:roles');
    
    if (!hasAssignPermission) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    
    const { userIds } = req.body;
    
    if (!userIds || !Array.isArray(userIds)) {
      return res.status(400).json({ error: 'User IDs array is required' });
    }
    
    const role = await Role.findByPk(req.params.id);
    
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }
    
    // Assign role to users
    const assignedUsers = [];
    for (const userId of userIds) {
      const success = await assignRoleToUser(userId, role.id);
      if (success) {
        assignedUsers.push(userId);
      }
    }
    
    // Audit log
    await createAuditLog({
      action: 'role_assigned_to_users',
      resourceType: 'role',
      resourceId: role.id.toString(),
      details: {
        roleName: role.name,
        userIds: assignedUsers
      },
      userId: req.user.id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });
    
    res.json({ message: 'Role assigned to users successfully', assignedUsers });
  } catch (error) {
    logger.error('Error assigning role to users:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   DELETE /api/roles/:id/users/:userId
 * @desc    Remove role from user
 * @access  Private
 */
router.delete('/:id/users/:userId', async (req, res) => {
  try {
    // Check if user has permission to assign roles
    const hasAssignPermission = await hasPermission(req.user.id, 'assign:roles');
    
    if (!hasAssignPermission) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    
    const role = await Role.findByPk(req.params.id);
    
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }
    
    const user = await User.findByPk(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Remove role from user
    const success = await removeRoleFromUser(user.id, role.id);
    
    if (!success) {
      return res.status(400).json({ error: 'Failed to remove role from user' });
    }
    
    // Audit log
    await createAuditLog({
      action: 'role_removed_from_user',
      resourceType: 'role',
      resourceId: role.id.toString(),
      details: {
        roleName: role.name,
        username: user.username,
        userId: user.id
      },
      userId: req.user.id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });
    
    res.json({ message: 'Role removed from user successfully' });
  } catch (error) {
    logger.error('Error removing role from user:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 