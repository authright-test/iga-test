import { Op } from 'sequelize';
import { models } from '../models/index.js';
import cacheService from './cacheService.js';

class SecurityService {
  // 使用批量查询和分页优化，并添加缓存
  async getSecurityStats(orgId, page = 1, limit = 20) {
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
  }

  // 优化事件查询，添加缓存
  async getSecurityEvents(orgId, filters = {}, page = 1, limit = 20) {
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

      // 使用事务确保数据一致性
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
  }

  // 优化威胁分析查询，添加缓存
  async analyzeThreats(orgId) {
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
  }

  // 优化推荐生成，添加缓存
  async generateRecommendations(orgId) {
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
  }

  // 清除组织的缓存
  async clearCache(orgId) {
    await cacheService.clearOrgCache(orgId);
  }
}

export {
  checkSecurityCompliance,
  enforceSecurityPolicies,
  monitorSecurityEvents
};
