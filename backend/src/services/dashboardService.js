import logger from '../utils/logger.js';
import { getRepositories } from './repositoryService.js';
import { getOrganizationMembers } from './organizationService.js';
import { getAuditLogs } from './auditService.js';

/**
 * Get dashboard data for an organization
 * @param {number} organizationId - Organization ID
 * @returns {Object} Dashboard data
 */
export const getDashboardData = async (organizationId) => {
  try {
    const [repositories, members, auditLogs] = await Promise.all([
      getRepositories(organizationId),
      getOrganizationMembers(organizationId),
      getAuditLogs(organizationId)
    ]);

    return {
      repositories,
      members,
      auditLogs
    };
  } catch (error) {
    logger.error('Error getting dashboard data:', error);
    throw error;
  }
};

/**
 * Get dashboard statistics for an organization
 * @param {string} organizationId - The organization ID
 * @returns {Promise<Object>} Dashboard statistics
 */
export const getDashboardStats = async (organizationId) => {
  try {
    // Get repositories count
    const repositories = await getRepositories(organizationId);
    const repoCount = repositories.length;

    // Get members count
    const members = await getOrganizationMembers(organizationId);
    const memberCount = members.length;

    // Get recent audit logs
    const auditLogs = await getAuditLogs(organizationId, { limit: 100 });
    
    // Calculate statistics
    const stats = [
      {
        title: 'Total Repositories',
        value: repoCount,
        change: 0 // TODO: Calculate change from previous period
      },
      {
        title: 'Total Members',
        value: memberCount,
        change: 0 // TODO: Calculate change from previous period
      },
      {
        title: 'Active Users',
        value: auditLogs.filter(log => 
          new Date(log.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length,
        change: 0 // TODO: Calculate change from previous period
      },
      {
        title: 'Recent Activities',
        value: auditLogs.length,
        change: 0 // TODO: Calculate change from previous period
      }
    ];

    return stats;
  } catch (error) {
    logger.error('Error getting dashboard stats:', error);
    throw error;
  }
};

/**
 * Get recent activities for an organization
 * @param {string} organizationId - The organization ID
 * @returns {Promise<Array>} Recent activities
 */
export const getRecentActivities = async (organizationId) => {
  try {
    // Get recent audit logs
    const auditLogs = await getAuditLogs(organizationId, { 
      limit: 50,
      sort: 'desc'
    });

    // Transform audit logs into activities
    const activities = auditLogs.map(log => ({
      id: log.id,
      type: log.action,
      timestamp: log.timestamp,
      user: log.user,
      details: log.details,
      resource: log.resource
    }));

    return activities;
  } catch (error) {
    logger.error('Error getting recent activities:', error);
    throw error;
  }
}; 