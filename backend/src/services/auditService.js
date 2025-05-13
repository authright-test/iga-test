const { AuditLog, User, Organization, Repository, Team } = require('../models');
const logger = require('../utils/logger');
const { Op } = require('sequelize');
const { Parser } = require('json2csv');

/**
 * Create an audit log entry
 * @param {Object} logData - Audit log data
 * @returns {Object} Created audit log
 */
const createAuditLog = async (logData) => {
  try {
    const auditLog = await AuditLog.create({
      action: logData.action,
      resourceType: logData.resourceType,
      resourceId: logData.resourceId,
      details: logData.details || {},
      ipAddress: logData.ipAddress,
      userAgent: logData.userAgent,
      UserId: logData.userId
    });
    
    return auditLog;
  } catch (error) {
    logger.error('Error creating audit log:', error);
    throw error;
  }
};

/**
 * Get audit logs with pagination and filtering
 * @param {Object} filters - Filter criteria
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Object} Paginated audit logs
 */
const getAuditLogs = async (filters = {}, page = 1, limit = 20) => {
  try {
    const offset = (page - 1) * limit;
    
    // Build query conditions
    const where = {};
    
    if (filters.action) {
      where.action = filters.action;
    }
    
    if (filters.resourceType) {
      where.resourceType = filters.resourceType;
    }
    
    if (filters.resourceId) {
      where.resourceId = filters.resourceId;
    }
    
    if (filters.userId) {
      where.UserId = filters.userId;
    }
    
    if (filters.startDate && filters.endDate) {
      where.createdAt = {
        [Op.between]: [new Date(filters.startDate), new Date(filters.endDate)]
      };
    } else if (filters.startDate) {
      where.createdAt = {
        [Op.gte]: new Date(filters.startDate)
      };
    } else if (filters.endDate) {
      where.createdAt = {
        [Op.lte]: new Date(filters.endDate)
      };
    }
    
    // Search in details JSON
    if (filters.searchTerm) {
      where[Op.or] = [
        { resourceId: { [Op.like]: `%${filters.searchTerm}%` } },
        { action: { [Op.like]: `%${filters.searchTerm}%` } },
        { resourceType: { [Op.like]: `%${filters.searchTerm}%` } }
      ];
    }
    
    // Get audit logs with pagination
    const { count, rows } = await AuditLog.findAndCountAll({
      where,
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'email', 'avatarUrl']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });
    
    return {
      logs: rows,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    };
  } catch (error) {
    logger.error('Error getting audit logs:', error);
    throw error;
  }
};

/**
 * Get audit logs for a specific organization
 * @param {number} organizationId - Organization ID
 * @param {Object} filters - Filter criteria
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Object} Paginated audit logs
 */
const getOrganizationAuditLogs = async (organizationId, filters = {}, page = 1, limit = 20) => {
  try {
    // Get all resources (repositories, teams) belonging to this organization
    const organization = await Organization.findByPk(organizationId, {
      include: [
        {
          model: Repository,
          attributes: ['id']
        },
        {
          model: Team,
          attributes: ['id']
        }
      ]
    });
    
    if (!organization) {
      throw new Error('Organization not found');
    }
    
    // Get resource IDs
    const repositoryIds = organization.Repositories.map(repo => repo.id.toString());
    const teamIds = organization.Teams.map(team => team.id.toString());
    
    // Include organization ID
    const resourceIds = [
      organizationId.toString(),
      ...repositoryIds,
      ...teamIds
    ];
    
    // Override resourceId filter to include all organization resources
    const orgFilters = {
      ...filters,
      resourceId: {
        [Op.in]: resourceIds
      }
    };
    
    return getAuditLogs(orgFilters, page, limit);
  } catch (error) {
    logger.error('Error getting organization audit logs:', error);
    throw error;
  }
};

/**
 * Get audit log summary statistics
 * @param {Object} filters - Filter criteria
 * @returns {Object} Summary statistics
 */
const getAuditLogStats = async (filters = {}) => {
  try {
    // Build query conditions based on filters
    const where = {};
    
    if (filters.startDate && filters.endDate) {
      where.createdAt = {
        [Op.between]: [new Date(filters.startDate), new Date(filters.endDate)]
      };
    } else if (filters.startDate) {
      where.createdAt = {
        [Op.gte]: new Date(filters.startDate)
      };
    } else if (filters.endDate) {
      where.createdAt = {
        [Op.lte]: new Date(filters.endDate)
      };
    }
    
    if (filters.resourceType) {
      where.resourceType = filters.resourceType;
    }
    
    // Count by action type
    const actionCounts = await AuditLog.findAll({
      where,
      attributes: [
        'action',
        [AuditLog.sequelize.fn('COUNT', AuditLog.sequelize.col('action')), 'count']
      ],
      group: ['action'],
      order: [[AuditLog.sequelize.literal('count'), 'DESC']]
    });
    
    // Count by resource type
    const resourceCounts = await AuditLog.findAll({
      where,
      attributes: [
        'resourceType',
        [AuditLog.sequelize.fn('COUNT', AuditLog.sequelize.col('resourceType')), 'count']
      ],
      group: ['resourceType'],
      order: [[AuditLog.sequelize.literal('count'), 'DESC']]
    });
    
    // Count by user
    const userCounts = await AuditLog.findAll({
      where,
      attributes: [
        'UserId',
        [AuditLog.sequelize.fn('COUNT', AuditLog.sequelize.col('UserId')), 'count']
      ],
      include: [
        {
          model: User,
          attributes: ['username', 'email']
        }
      ],
      group: ['UserId'],
      order: [[AuditLog.sequelize.literal('count'), 'DESC']],
      limit: 10
    });
    
    // Get recent activity trend (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const activityTrend = await AuditLog.findAll({
      where: {
        ...where,
        createdAt: {
          [Op.gte]: sevenDaysAgo
        }
      },
      attributes: [
        [AuditLog.sequelize.fn('DATE', AuditLog.sequelize.col('createdAt')), 'date'],
        [AuditLog.sequelize.fn('COUNT', AuditLog.sequelize.col('id')), 'count']
      ],
      group: [AuditLog.sequelize.fn('DATE', AuditLog.sequelize.col('createdAt'))],
      order: [[AuditLog.sequelize.literal('date'), 'ASC']]
    });
    
    return {
      actionCounts,
      resourceCounts,
      userCounts,
      activityTrend
    };
  } catch (error) {
    logger.error('Error getting audit log stats:', error);
    throw error;
  }
};

/**
 * Get access history with pagination and filtering
 * @param {number} organizationId - Organization ID
 * @param {Object} filters - Filter criteria
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Object} Paginated access history
 */
const getAccessHistory = async (organizationId, filters = {}, page = 1, limit = 50) => {
  try {
    const offset = (page - 1) * limit;
    
    // Build query conditions
    const where = {
      organizationId
    };
    
    if (filters.type) {
      where.type = filters.type;
    }
    
    if (filters.userId) {
      where.UserId = filters.userId;
    }
    
    if (filters.repositoryId) {
      where.RepositoryId = filters.repositoryId;
    }
    
    if (filters.teamId) {
      where.TeamId = filters.teamId;
    }
    
    if (filters.startDate && filters.endDate) {
      where.createdAt = {
        [Op.between]: [new Date(filters.startDate), new Date(filters.endDate)]
      };
    } else if (filters.startDate) {
      where.createdAt = {
        [Op.gte]: new Date(filters.startDate)
      };
    } else if (filters.endDate) {
      where.createdAt = {
        [Op.lte]: new Date(filters.endDate)
      };
    }
    
    // Get access history with pagination
    const { count, rows } = await AuditLog.findAndCountAll({
      where,
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'email', 'avatarUrl']
        },
        {
          model: Repository,
          attributes: ['id', 'name', 'fullName']
        },
        {
          model: Team,
          attributes: ['id', 'name', 'description']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });
    
    return {
      history: rows,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    };
  } catch (error) {
    logger.error('Error getting access history:', error);
    throw error;
  }
};

/**
 * Get access history for a specific user
 * @param {number} organizationId - Organization ID
 * @param {number} userId - User ID
 * @param {Object} filters - Filter criteria
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Object} Paginated access history
 */
const getAccessHistoryByUser = async (organizationId, userId, filters = {}, page = 1, limit = 50) => {
  try {
    return getAccessHistory(organizationId, { ...filters, userId }, page, limit);
  } catch (error) {
    logger.error('Error getting user access history:', error);
    throw error;
  }
};

/**
 * Get access history for a specific repository
 * @param {number} organizationId - Organization ID
 * @param {number} repositoryId - Repository ID
 * @param {Object} filters - Filter criteria
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Object} Paginated access history
 */
const getAccessHistoryByRepository = async (organizationId, repositoryId, filters = {}, page = 1, limit = 50) => {
  try {
    return getAccessHistory(organizationId, { ...filters, repositoryId }, page, limit);
  } catch (error) {
    logger.error('Error getting repository access history:', error);
    throw error;
  }
};

/**
 * Get access history for a specific team
 * @param {number} organizationId - Organization ID
 * @param {number} teamId - Team ID
 * @param {Object} filters - Filter criteria
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Object} Paginated access history
 */
const getAccessHistoryByTeam = async (organizationId, teamId, filters = {}, page = 1, limit = 50) => {
  try {
    return getAccessHistory(organizationId, { ...filters, teamId }, page, limit);
  } catch (error) {
    logger.error('Error getting team access history:', error);
    throw error;
  }
};

/**
 * Export access history
 * @param {number} organizationId - Organization ID
 * @param {Object} filters - Filter criteria
 * @param {string} format - Export format (csv or json)
 * @returns {Object} Export data and filename
 */
const exportAccessHistory = async (organizationId, filters = {}, format = 'csv') => {
  try {
    // Get all matching records without pagination
    const { history } = await getAccessHistory(organizationId, filters, 1, 10000);
    
    // Format data for export
    const exportData = history.map(record => ({
      timestamp: record.createdAt,
      type: record.type,
      action: record.action,
      user: record.User?.username,
      repository: record.Repository?.name,
      team: record.Team?.name,
      details: JSON.stringify(record.details)
    }));
    
    let data;
    let filename;
    
    if (format === 'csv') {
      const fields = ['timestamp', 'type', 'action', 'user', 'repository', 'team', 'details'];
      const parser = new Parser({ fields });
      data = parser.parse(exportData);
      filename = `access-history-${new Date().toISOString()}.csv`;
    } else {
      data = JSON.stringify(exportData, null, 2);
      filename = `access-history-${new Date().toISOString()}.json`;
    }
    
    return { data, filename };
  } catch (error) {
    logger.error('Error exporting access history:', error);
    throw error;
  }
};

module.exports = {
  createAuditLog,
  getAuditLogs,
  getOrganizationAuditLogs,
  getAuditLogStats,
  getAccessHistory,
  getAccessHistoryByUser,
  getAccessHistoryByRepository,
  getAccessHistoryByTeam,
  exportAccessHistory
}; 