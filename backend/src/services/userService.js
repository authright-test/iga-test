import { User, Organization, Role, Team } from '../models/index.js';
import { createAuditLog } from './auditService.js';
import logger from '../utils/logger.js';
import { Op } from 'sequelize';

/**
 * Get all users for an organization with pagination, search and sorting
 * @param {number} organizationId - Organization ID
 * @param {Object} options - Query options
 * @param {number} options.page - Page number (0-based)
 * @param {number} options.size - Page size
 * @param {string} options.searchKeyword - Search keyword for username or email
 * @param {string} options.sort - Sort field and direction (e.g. "username,asc")
 * @returns {Promise<Object>} Paginated users data
 */
export const getOrganizationUsers = async (organizationId, options = {}) => {
  try {
    const {
      page = 0,
      size = 20,
      searchKeyword = '',
      sort = 'username,asc'
    } = options;

    // Parse sort parameter
    const [sortField, sortDirection] = sort.split(',');
    const order = [[sortField, sortDirection.toUpperCase()]];

    // Build where clause
    let where = {}
    if (organizationId) {
      // FIXME comment out for dev only
      // where = { ...where, organizationId }
    }
    if (searchKeyword) {
      where = {
        ...where,
        [Op.or]: [
          { username: { [Op.iLike]: `%${searchKeyword}%` } },
          { email: { [Op.iLike]: `%${searchKeyword}%` } }
        ]
      }
    }

    // Get total count
    const totalElements = await User.count({ where });

    // Get paginated data
    const users = await User.findAll({
      where,
      //   include: [
      //     {
      //       model: Organization,
      //       attributes: ['id', 'name']
      //     },
      //     {
      //       model: Role,
      //       attributes: ['id', 'name', 'description']
      //     },
      //     {
      //       model: Team,
      //       attributes: ['id', 'name', 'description']
      //     }
      //   ],
      order,
      limit: size,
      offset: page * size
    });

    // Calculate total pages
    const totalPages = Math.ceil(totalElements / size);

    return {
      content: users,
      totalElements,
      totalPages,
      size,
      number: page
    };
  } catch (error) {
    logger.error('Error in getOrganizationUsers:', error);
    throw error;
  }
};

/**
 * Create a new user
 * @param {Object} userData - User data
 * @param {number} organizationId - Organization ID
 * @param {number} userId - User ID who created the user
 * @returns {Promise<Object>} Created user
 */
export const createUser = async (userData, organizationId, userId) => {
  try {
    const { username, email, role, status } = userData;

    // Create user
    const user = await User.create({
      username,
      email,
      role,
      status,
      organizationId,
      isSystem: false
    });

    // Audit log
    await createAuditLog({
      action: 'user_created',
      resourceType: 'user',
      resourceId: user.id.toString(),
      details: {
        username: user.username,
        organizationId,
        role
      },
      userId,
      ipAddress: null,
      userAgent: null
    });

    // Return user with relations
    return await User.findByPk(user.id, {
      include: [
        {
          model: Organization,
          attributes: ['id', 'name']
        },
        {
          model: Role,
          attributes: ['id', 'name', 'description']
        },
        {
          model: Team,
          attributes: ['id', 'name', 'description']
        }
      ]
    });
  } catch (error) {
    logger.error('Error in createUser:', error);
    throw error;
  }
};

/**
 * Update a user
 * @param {number} userId - User ID
 * @param {Object} userData - Updated user data
 * @param {number} updatedBy - User ID who updated the user
 * @returns {Promise<Object>} Updated user
 */
export const updateUser = async (userId, userData, updatedBy) => {
  try {
    const { username, email, role, status } = userData;

    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Don't allow modifying system users
    if (user.isSystem) {
      throw new Error('System users cannot be modified');
    }

    // Update user
    await user.update({
      username,
      email,
      role,
      status
    });

    // Audit log
    await createAuditLog({
      action: 'user_updated',
      resourceType: 'user',
      resourceId: user.id.toString(),
      details: {
        username: user.username,
        changes: userData
      },
      userId: updatedBy,
      ipAddress: null,
      userAgent: null
    });

    // Return updated user with relations
    return await User.findByPk(user.id, {
      include: [
        {
          model: Organization,
          attributes: ['id', 'name']
        },
        {
          model: Role,
          attributes: ['id', 'name', 'description']
        },
        {
          model: Team,
          attributes: ['id', 'name', 'description']
        }
      ]
    });
  } catch (error) {
    logger.error('Error in updateUser:', error);
    throw error;
  }
};

/**
 * Delete a user
 * @param {number} userId - User ID
 * @param {number} deletedBy - User ID who deleted the user
 * @returns {Promise<boolean>} Success status
 */
export const deleteUser = async (userId, deletedBy) => {
  try {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Don't allow deleting system users
    if (user.isSystem) {
      throw new Error('System users cannot be deleted');
    }

    const username = user.username;
    const userId = user.id;

    // Delete user
    await user.destroy();

    // Audit log
    await createAuditLog({
      action: 'user_deleted',
      resourceType: 'user',
      resourceId: userId.toString(),
      details: {
        username
      },
      userId: deletedBy,
      ipAddress: null,
      userAgent: null
    });

    return true;
  } catch (error) {
    logger.error('Error in deleteUser:', error);
    throw error;
  }
};

/**
 * Get user roles
 * @param {number} userId - User ID
 * @returns {Promise<Array>} User roles
 */
export const getUserRoles = async (userId) => {
  try {
    const user = await User.findByPk(userId, {
      include: [Role]
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user.Roles;
  } catch (error) {
    logger.error('Error in getUserRoles:', error);
    throw error;
  }
};

/**
 * Assign role to user
 * @param {number} userId - User ID
 * @param {number} roleId - Role ID
 * @param {number} assignedBy - User ID who assigned the role
 * @returns {Promise<Object>} Updated user
 */
export const assignRoleToUser = async (userId, roleId, assignedBy) => {
  try {
    const user = await User.findByPk(userId);
    const role = await Role.findByPk(roleId);

    if (!user) {
      throw new Error('User not found');
    }
    if (!role) {
      throw new Error('Role not found');
    }

    // Assign role
    await user.addRole(role);

    // Audit log
    await createAuditLog({
      action: 'role_assigned_to_user',
      resourceType: 'user',
      resourceId: user.id.toString(),
      details: {
        username: user.username,
        roleName: role.name,
        roleId
      },
      userId: assignedBy,
      ipAddress: null,
      userAgent: null
    });

    return await User.findByPk(userId, {
      include: [Role]
    });
  } catch (error) {
    logger.error('Error in assignRoleToUser:', error);
    throw error;
  }
};

/**
 * Remove role from user
 * @param {number} userId - User ID
 * @param {number} roleId - Role ID
 * @param {number} removedBy - User ID who removed the role
 * @returns {Promise<Object>} Updated user
 */
export const removeRoleFromUser = async (userId, roleId, removedBy) => {
  try {
    const user = await User.findByPk(userId);
    const role = await Role.findByPk(roleId);

    if (!user) {
      throw new Error('User not found');
    }
    if (!role) {
      throw new Error('Role not found');
    }

    // Remove role
    await user.removeRole(role);

    // Audit log
    await createAuditLog({
      action: 'role_removed_from_user',
      resourceType: 'user',
      resourceId: user.id.toString(),
      details: {
        username: user.username,
        roleName: role.name,
        roleId
      },
      userId: removedBy,
      ipAddress: null,
      userAgent: null
    });

    return await User.findByPk(userId, {
      include: [Role]
    });
  } catch (error) {
    logger.error('Error in removeRoleFromUser:', error);
    throw error;
  }
};
