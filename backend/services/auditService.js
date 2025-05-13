const { AuditLog } = require('../models');

/**
 * 审计服务 - 提供统一的审计日志记录功能
 */
class AuditService {
  /**
   * 记录审计事件
   * @param {Object} options - 审计日志选项
   * @param {number} [options.userId] - 用户ID，如果是系统操作可为null
   * @param {number} options.organizationId - 组织ID
   * @param {string} options.action - 执行的操作
   * @param {string} options.resourceType - 资源类型
   * @param {string} options.resourceId - 资源标识符
   * @param {Object} [options.details={}] - 操作的详细信息
   * @returns {Promise<boolean>} 是否记录成功
   */
  static async logEvent({ userId, organizationId, action, resourceType, resourceId, details = {} }) {
    try {
      await AuditLog.create({
        userId,
        organizationId,
        action,
        resourceType,
        resourceId,
        details
      });
      return true;
    } catch (error) {
      console.error('Error logging audit event:', error);
      return false;
    }
  }

  /**
   * 记录策略违反事件
   * @param {Object} options - 审计日志选项
   * @param {number} options.organizationId - 组织ID
   * @param {number} [options.userId] - 用户ID
   * @param {string} options.policyName - 策略名称
   * @param {string} options.resourceType - 资源类型
   * @param {string} options.resourceId - 资源标识符
   * @param {Object} [options.details={}] - 操作的详细信息
   * @returns {Promise<boolean>} 是否记录成功
   */
  static async logPolicyViolation({ 
    organizationId, 
    userId,
    policyName, 
    resourceType, 
    resourceId, 
    details = {} 
  }) {
    const enhancedDetails = {
      ...details,
      policyName,
      timestamp: new Date().toISOString()
    };

    return this.logEvent({
      userId,
      organizationId,
      action: 'policy_violated',
      resourceType,
      resourceId,
      details: enhancedDetails
    });
  }

  /**
   * 记录资源访问事件
   * @param {Object} options - 审计日志选项
   * @param {number} options.organizationId - 组织ID
   * @param {number} options.userId - 用户ID
   * @param {string} options.action - 访问类型 (read, write, delete)
   * @param {string} options.resourceType - 资源类型
   * @param {string} options.resourceId - 资源标识符
   * @param {Object} [options.details={}] - 操作的详细信息
   * @returns {Promise<boolean>} 是否记录成功
   */
  static async logResourceAccess({ 
    organizationId, 
    userId, 
    action, 
    resourceType, 
    resourceId, 
    details = {} 
  }) {
    const accessAction = `${resourceType}_${action}`;
    
    return this.logEvent({
      userId,
      organizationId,
      action: accessAction,
      resourceType,
      resourceId,
      details: {
        ...details,
        accessType: action,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * 记录用户管理事件
   * @param {Object} options - 审计日志选项
   * @param {number} options.organizationId - 组织ID
   * @param {number} options.performedBy - 执行操作的用户ID
   * @param {number} options.targetUserId - 目标用户ID
   * @param {string} options.action - 操作类型 (added, removed, role_changed)
   * @param {Object} [options.details={}] - 操作的详细信息
   * @returns {Promise<boolean>} 是否记录成功
   */
  static async logUserManagement({ 
    organizationId, 
    performedBy, 
    targetUserId, 
    action, 
    details = {} 
  }) {
    return this.logEvent({
      userId: performedBy,
      organizationId,
      action: `user_${action}`,
      resourceType: 'user',
      resourceId: targetUserId.toString(),
      details
    });
  }
}

module.exports = AuditService; 