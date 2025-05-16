import logger from '../utils/logger.js';
import { getUserRoles } from './roles.js';
import { getRolePermissions } from './roles.js';

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
    const permissionsPromises = roles.map(role => getRolePermissions(role.id));
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
    const permissions = await getUserPermissions(userId);
    
    return permissions.some(permission => 
      permission.name === permissionName && 
      (!resource || permission.resource === resource)
    );
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
    const userPermissions = await getUserPermissions(userId);
    
    const results = {};
    for (const permission of permissions) {
      results[permission.name] = userPermissions.some(p => 
        p.name === permission.name && 
        (!permission.resource || p.resource === permission.resource)
      );
    }
    
    return results;
  } catch (error) {
    logger.error('Error checking multiple permissions:', error);
    throw error;
  }
}; 