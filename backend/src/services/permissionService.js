import logger from '../utils/logger.js';
import {
  hasPermission,
  getUserRoles,
  addPermissionToRole,
  removePermissionFromRole,
  assignRoleToUser,
  removeRoleFromUser
} from './accessControlService.js';

/**
 * Get all permissions for a user
 * @param {string} userId - The user ID
 * @returns {Promise<Array>} User permissions
 */
export const getUserPermissions = async (userId) => {
  try {
    // Get user roles
    const roles = await getUserRoles(userId);
    
    // Get permissions for each role
    const permissionsPromises = roles.map(role => role.getPermissions());
    const rolePermissions = await Promise.all(permissionsPromises);
    
    // Combine and deduplicate permissions
    const permissions = rolePermissions
      .flat()
      .filter((permission, index, self) => 
        index === self.findIndex(p => 
          p.name === permission.name && p.resource === permission.resource
        )
      );

    return permissions;
  } catch (error) {
    logger.error('Error getting user permissions:', error);
    throw error;
  }
};

/**
 * Check if a user has a specific permission
 * @param {string} userId - The user ID
 * @param {string} permissionName - The permission name
 * @param {string} resource - Optional resource identifier
 * @returns {Promise<boolean>} Whether the user has the permission
 */
export const checkPermission = async (userId, permissionName, resource = null) => {
  try {
    return await hasPermission(userId, permissionName, resource);
  } catch (error) {
    logger.error('Error checking permission:', error);
    throw error;
  }
};

/**
 * Check multiple permissions for a user
 * @param {string} userId - The user ID
 * @param {Array<{name: string, resource?: string}>} permissions - Array of permissions to check
 * @returns {Promise<Object>} Results for each permission check
 */
export const checkMultiplePermissions = async (userId, permissions) => {
  try {
    const results = {};
    for (const permission of permissions) {
      results[permission.name] = await hasPermission(
        userId,
        permission.name,
        permission.resource
      );
    }
    return results;
  } catch (error) {
    logger.error('Error checking multiple permissions:', error);
    throw error;
  }
};

/**
 * Add a permission to a role
 * @param {string} roleId - The role ID
 * @param {string} permissionName - The permission name
 * @param {string} resource - Optional resource identifier
 * @returns {Promise<boolean>} Success status
 */
export const addPermission = async (roleId, permissionName, resource = null) => {
  try {
    return await addPermissionToRole(roleId, permissionName, resource);
  } catch (error) {
    logger.error('Error adding permission:', error);
    throw error;
  }
};

/**
 * Remove a permission from a role
 * @param {string} roleId - The role ID
 * @param {string} permissionName - The permission name
 * @param {string} resource - Optional resource identifier
 * @returns {Promise<boolean>} Success status
 */
export const removePermission = async (roleId, permissionName, resource = null) => {
  try {
    return await removePermissionFromRole(roleId, permissionName, resource);
  } catch (error) {
    logger.error('Error removing permission:', error);
    throw error;
  }
};

/**
 * Assign a role to a user
 * @param {string} userId - The user ID
 * @param {string} roleId - The role ID
 * @returns {Promise<boolean>} Success status
 */
export const assignRole = async (userId, roleId) => {
  try {
    return await assignRoleToUser(userId, roleId);
  } catch (error) {
    logger.error('Error assigning role:', error);
    throw error;
  }
};

/**
 * Remove a role from a user
 * @param {string} userId - The user ID
 * @param {string} roleId - The role ID
 * @returns {Promise<boolean>} Success status
 */
export const removeRole = async (userId, roleId) => {
  try {
    return await removeRoleFromUser(userId, roleId);
  } catch (error) {
    logger.error('Error removing role:', error);
    throw error;
  }
};

/**
 * Get all roles for a user
 * @param {string} userId - The user ID
 * @returns {Promise<Array>} User roles
 */
export const getRoles = async (userId) => {
  try {
    return await getUserRoles(userId);
  } catch (error) {
    logger.error('Error getting user roles:', error);
    throw error;
  }
}; 