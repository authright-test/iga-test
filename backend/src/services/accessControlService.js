import { redisClient } from '../config/redis.js';
import { Permission, Repository, Role, Team, User } from '../models/index.js';
import logger from '../utils/logger.js';

/**
 * Check if a user has a specific permission
 * @param {number} userId - User ID
 * @param {string} permissionName - Permission name
 * @param {Object} resource - Optional resource to check permission against
 * @returns {boolean} Whether user has permission
 */
const hasPermission = async (userId, permissionName, resource = null) => {
  try {
    // Try to get from cache first
    const cacheKey = `permission:${userId}:${permissionName}:${resource?.id || 'global'}`;
    const cachedResult = await redisClient.get(cacheKey);

    if (cachedResult) {
      return cachedResult === 'true';
    }

    // Get user with roles and permissions
    const user = await User.findByPk(userId, {
      include: [
        {
          model: Role,
          include: [Permission]
        }
      ]
    });

    if (!user) {
      return false;
    }

    // Check if user has permission through any role
    for (const role of user.Roles) {
      for (const permission of role.Permissions) {
        if (permission.name === permissionName) {
          // Cache result for 10 minutes
          await redisClient.set(cacheKey, 'true', { EX: 600 });
          return true;
        }
      }
    }

    // Resource-specific check (e.g., repository or team permission)
    if (resource) {
      // Depending on resource type, perform specific checks
      if (resource.type === 'repository') {
        const repository = await Repository.findByPk(resource.id, {
          include: [
            {
              model: Team,
              as: 'Teams',
              include: [User]
            }
          ]
        });

        // Check if user is in any team with access to this repository
        for (const team of repository.Teams) {
          for (const teamUser of team.Users) {
            if (teamUser.id === userId) {
              // Cache result for 10 minutes
              await redisClient.set(cacheKey, 'true', { EX: 600 });
              return true;
            }
          }
        }
      }
    }

    // Cache negative result for 5 minutes
    await redisClient.set(cacheKey, 'false', { EX: 300 });
    return false;
  } catch (error) {
    logger.error('Error checking permission:', error);
    return false;
  }
};

/**
 * Assign a role to a user
 * @param {number} userId - User ID
 * @param {number} roleId - Role ID
 * @returns {boolean} Success status
 */
const assignRoleToUser = async (userId, roleId) => {
  try {
    const user = await User.findByPk(userId);
    const role = await Role.findByPk(roleId);

    if (!user || !role) {
      return false;
    }

    await user.addRole(role);

    // Invalidate permissions cache for this user
    const keys = await redisClient.keys(`permission:${userId}:*`);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }

    return true;
  } catch (error) {
    logger.error('Error assigning role to user:', error);
    return false;
  }
};

/**
 * Remove a role from a user
 * @param {number} userId - User ID
 * @param {number} roleId - Role ID
 * @returns {boolean} Success status
 */
const removeRoleFromUser = async (userId, roleId) => {
  try {
    const user = await User.findByPk(userId);
    const role = await Role.findByPk(roleId);

    if (!user || !role) {
      return false;
    }

    await user.removeRole(role);

    // Invalidate permissions cache for this user
    const keys = await redisClient.keys(`permission:${userId}:*`);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }

    return true;
  } catch (error) {
    logger.error('Error removing role from user:', error);
    return false;
  }
};

/**
 * Get all roles for a user
 * @param {number} userId - User ID
 * @returns {Array} List of roles
 */
const getUserRoles = async (userId) => {
  try {
    const user = await User.findByPk(userId, {
      include: [Role]
    });

    if (!user) {
      return [];
    }

    return user.Roles;
  } catch (error) {
    logger.error('Error getting user roles:', error);
    return [];
  }
};

/**
 * Add a permission to a role
 * @param {number} roleId - Role ID
 * @param {number} permissionId - Permission ID
 * @returns {boolean} Success status
 */
const addPermissionToRole = async (roleId, permissionId) => {
  try {
    const role = await Role.findByPk(roleId);
    const permission = await Permission.findByPk(permissionId);

    if (!role || !permission) {
      return false;
    }

    await role.addPermission(permission);

    // Invalidate permissions cache for all users with this role
    const users = await User.findAll({
      include: [
        {
          model: Role,
          where: { id: roleId }
        }
      ]
    });

    for (const user of users) {
      const keys = await redisClient.keys(`permission:${user.id}:*`);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    }

    return true;
  } catch (error) {
    logger.error('Error adding permission to role:', error);
    return false;
  }
};

/**
 * Remove a permission from a role
 * @param {number} roleId - Role ID
 * @param {number} permissionId - Permission ID
 * @returns {boolean} Success status
 */
const removePermissionFromRole = async (roleId, permissionId) => {
  try {
    const role = await Role.findByPk(roleId);
    const permission = await Permission.findByPk(permissionId);

    if (!role || !permission) {
      return false;
    }

    await role.removePermission(permission);

    // Invalidate permissions cache for all users with this role
    const users = await User.findAll({
      include: [
        {
          model: Role,
          where: { id: roleId }
        }
      ]
    });

    for (const user of users) {
      const keys = await redisClient.keys(`permission:${user.id}:*`);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    }

    return true;
  } catch (error) {
    logger.error('Error removing permission from role:', error);
    return false;
  }
};

export {
  hasPermission,
  assignRoleToUser,
  removeRoleFromUser,
  getUserRoles,
  addPermissionToRole,
  removePermissionFromRole
};
