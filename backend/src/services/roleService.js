import { Role, Organization, Permission } from '../models/index.js';
import { createAuditLog } from './auditService.js';
import logger from '../utils/logger.js';

/**
 * Get all roles for an organization
 * @param {number} organizationId - Organization ID
 * @returns {Promise<Array>} Array of roles
 */
export const getOrganizationRoles = async (organizationId) => {
  try {
    const roles = await Role.findAll({
      where: { organizationId },
      include: [
        {
          model: Organization,
          attributes: ['id', 'name']
        },
        {
          model: Permission,
          attributes: ['id', 'name', 'description']
        }
      ]
    });
    return roles;
  } catch (error) {
    logger.error('Error in getOrganizationRoles:', error);
    throw error;
  }
};

/**
 * Create a new role
 * @param {Object} roleData - Role data
 * @param {number} organizationId - Organization ID
 * @param {number} userId - User ID who created the role
 * @returns {Promise<Object>} Created role
 */
export const createRole = async (roleData, organizationId, userId) => {
  try {
    const { name, description, permissions } = roleData;

    // Create role
    const role = await Role.create({
      name,
      description,
      organizationId,
      isSystem: false
    });

    // Add permissions if provided
    if (permissions && permissions.length > 0) {
      await role.setPermissions(permissions);
    }

    // Audit log
    await createAuditLog({
      action: 'role_created',
      resourceType: 'role',
      resourceId: role.id.toString(),
      details: {
        roleName: role.name,
        organizationId,
        permissions
      },
      userId,
      ipAddress: null,
      userAgent: null
    });

    // Return role with permissions
    return await Role.findByPk(role.id, {
      include: [
        {
          model: Organization,
          attributes: ['id', 'name']
        },
        {
          model: Permission,
          attributes: ['id', 'name', 'description']
        }
      ]
    });
  } catch (error) {
    logger.error('Error in createRole:', error);
    throw error;
  }
};

/**
 * Update a role
 * @param {number} roleId - Role ID
 * @param {Object} roleData - Updated role data
 * @param {number} userId - User ID who updated the role
 * @returns {Promise<Object>} Updated role
 */
export const updateRole = async (roleId, roleData, userId) => {
  try {
    const { name, description, permissions } = roleData;

    const role = await Role.findByPk(roleId);

    if (!role) {
      throw new Error('Role not found');
    }

    // Don't allow modifying system roles
    if (role.isSystem) {
      throw new Error('System roles cannot be modified');
    }

    // Update role
    await role.update({
      name,
      description
    });

    // Update permissions if provided
    if (permissions) {
      await role.setPermissions(permissions);
    }

    // Audit log
    await createAuditLog({
      action: 'role_updated',
      resourceType: 'role',
      resourceId: role.id.toString(),
      details: {
        roleName: role.name,
        changes: roleData
      },
      userId,
      ipAddress: null,
      userAgent: null
    });

    // Return updated role with permissions
    return await Role.findByPk(role.id, {
      include: [
        {
          model: Organization,
          attributes: ['id', 'name']
        },
        {
          model: Permission,
          attributes: ['id', 'name', 'description']
        }
      ]
    });
  } catch (error) {
    logger.error('Error in updateRole:', error);
    throw error;
  }
};

/**
 * Delete a role
 * @param {number} roleId - Role ID
 * @param {number} userId - User ID who deleted the role
 * @returns {Promise<boolean>} Success status
 */
export const deleteRole = async (roleId, userId) => {
  try {
    const role = await Role.findByPk(roleId);

    if (!role) {
      throw new Error('Role not found');
    }

    // Don't allow deleting system roles
    if (role.isSystem) {
      throw new Error('System roles cannot be deleted');
    }

    const roleName = role.name;
    const roleId = role.id;

    // Delete role
    await role.destroy();

    // Audit log
    await createAuditLog({
      action: 'role_deleted',
      resourceType: 'role',
      resourceId: roleId.toString(),
      details: {
        roleName
      },
      userId,
      ipAddress: null,
      userAgent: null
    });

    return true;
  } catch (error) {
    logger.error('Error in deleteRole:', error);
    throw error;
  }
}; 