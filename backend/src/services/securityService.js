import { Op } from 'sequelize';
import { models } from '../models/index.js';
import cacheService from './cacheService.js';

/**
 * Get security statistics for an organization
 * @param {number} orgId - Organization ID
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise<Object>} Security statistics
 */
export const getSecurityStats = async (orgId, page = 1, limit = 20) => {
  return cacheService.getSecurityStats(orgId, async () => {
    const offset = (page - 1) * limit;

    const [
      totalThreats,
      totalVulnerabilities,
      totalViolations,
      recentEvents,
      recommendations
    ] = await Promise.all([
      models.SecurityThreat.count({
        where: {
          organizationId: orgId,
          status: 'active'
        }
      }),
      models.Vulnerability.count({
        where: {
          organizationId: orgId,
          status: 'open'
        }
      }),
      models.AccessViolation.count({
        where: {
          organizationId: orgId,
          status: 'pending'
        }
      }),
      models.SecurityEvent.findAll({
        where: { organizationId: orgId },
        attributes: ['id', 'type', 'severity', 'timestamp', 'details'],
        order: [['timestamp', 'DESC']],
        limit,
        offset
      }),
      models.SecurityRecommendation.findAll({
        where: {
          organizationId: orgId,
          status: 'pending'
        },
        attributes: ['id', 'title', 'description', 'priority'],
        order: [['priority', 'DESC']],
        limit
      })
    ]);

    return {
      totalThreats,
      totalVulnerabilities,
      totalViolations,
      recentEvents,
      recommendations
    };
  });
};

/**
 * Get security events for an organization
 * @param {number} orgId - Organization ID
 * @param {Object} filters - Filter criteria
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise<Object>} Security events with pagination
 */
export const getSecurityEvents = async (orgId, filters = {}, page = 1, limit = 20) => {
  return cacheService.getSecurityEvents(orgId, filters, async () => {
    const offset = (page - 1) * limit;

    const where = {
      organizationId: orgId,
      ...(filters.severity && { severity: filters.severity }),
      ...(filters.type && { type: filters.type }),
      ...(filters.startDate && filters.endDate && {
        timestamp: {
          [Op.between]: [new Date(filters.startDate), new Date(filters.endDate)]
        }
      })
    };

    // Use transaction to ensure data consistency
    return await models.sequelize.transaction(async (t) => {
      const [total, events] = await Promise.all([
        models.SecurityEvent.count({ where }),
        models.SecurityEvent.findAll({
          where,
          attributes: ['id', 'type', 'severity', 'timestamp', 'details', 'source'],
          order: [['timestamp', 'DESC']],
          limit,
          offset,
          transaction: t
        })
      ]);

      return {
        total,
        events,
        page,
        totalPages: Math.ceil(total / limit)
      };
    });
  });
};

/**
 * Analyze security threats for an organization
 * @param {number} orgId - Organization ID
 * @returns {Promise<Array>} Threat analysis results
 */
export const analyzeThreats = async (orgId) => {
  return cacheService.getThreatAnalysis(orgId, async () => {
    const threatAnalysis = await models.sequelize.query(`
      SELECT 
        t.type,
        COUNT(*) as count,
        AVG(CASE WHEN t.severity = 'high' THEN 1 ELSE 0 END) as high_severity_ratio,
        MAX(t.timestamp) as latest_occurrence
      FROM "SecurityThreats" t
      WHERE t.organization_id = :orgId
      GROUP BY t.type
      ORDER BY count DESC
    `, {
      replacements: { orgId },
      type: models.sequelize.QueryTypes.SELECT
    });

    return threatAnalysis;
  });
};

/**
 * Generate security recommendations for an organization
 * @param {number} orgId - Organization ID
 * @returns {Promise<Array>} Security recommendations
 */
export const generateRecommendations = async (orgId) => {
  return cacheService.getRecommendations(orgId, async () => {
    const recommendations = await models.sequelize.query(`
      WITH threat_stats AS (
        SELECT 
          type,
          COUNT(*) as threat_count,
          AVG(CASE WHEN severity = 'high' THEN 1 ELSE 0 END) as high_severity_ratio
        FROM "SecurityThreats"
        WHERE organization_id = :orgId
        GROUP BY type
      )
      SELECT 
        t.type,
        t.threat_count,
        t.high_severity_ratio,
        r.recommendation_text
      FROM threat_stats t
      JOIN "RecommendationTemplates" r ON r.threat_type = t.type
      WHERE t.threat_count > 0
      ORDER BY t.high_severity_ratio DESC, t.threat_count DESC
    `, {
      replacements: { orgId },
      type: models.sequelize.QueryTypes.SELECT
    });

    return recommendations;
  });
};

/**
 * Clear organization's security cache
 * @param {number} orgId - Organization ID
 * @returns {Promise<void>}
 */
export const clearSecurityCache = async (orgId) => {
  await cacheService.clearOrgCache(orgId);
};
