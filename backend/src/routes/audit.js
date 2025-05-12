const express = require('express');
const { getAuditLogs, getOrganizationAuditLogs, getAuditLogStats } = require('../services/auditService');
const { hasPermission } = require('../services/accessControlService');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * @route   GET /api/audit/logs
 * @desc    Get audit logs with filtering and pagination
 * @access  Private
 */
router.get('/logs', async (req, res) => {
  try {
    // Check if user has permission to view audit logs
    const hasViewPermission = await hasPermission(req.user.id, 'view:audit_logs');
    
    if (!hasViewPermission) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    
    const {
      action,
      resourceType,
      resourceId,
      userId,
      startDate,
      endDate,
      page = 1,
      limit = 20,
      searchTerm
    } = req.query;
    
    const filters = {
      action,
      resourceType,
      resourceId,
      userId,
      startDate,
      endDate,
      searchTerm
    };
    
    const auditLogs = await getAuditLogs(filters, parseInt(page), parseInt(limit));
    
    res.json(auditLogs);
  } catch (error) {
    logger.error('Error getting audit logs:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/audit/organization/:organizationId/logs
 * @desc    Get audit logs for a specific organization
 * @access  Private
 */
router.get('/organization/:organizationId/logs', async (req, res) => {
  try {
    // Check if user has permission to view audit logs
    const hasViewPermission = await hasPermission(req.user.id, 'view:audit_logs');
    
    if (!hasViewPermission) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    
    const organizationId = req.params.organizationId;
    const {
      action,
      resourceType,
      userId,
      startDate,
      endDate,
      page = 1,
      limit = 20,
      searchTerm
    } = req.query;
    
    const filters = {
      action,
      resourceType,
      userId,
      startDate,
      endDate,
      searchTerm
    };
    
    const auditLogs = await getOrganizationAuditLogs(organizationId, filters, parseInt(page), parseInt(limit));
    
    res.json(auditLogs);
  } catch (error) {
    logger.error('Error getting organization audit logs:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/audit/stats
 * @desc    Get audit log statistics
 * @access  Private
 */
router.get('/stats', async (req, res) => {
  try {
    // Check if user has permission to view audit logs
    const hasViewPermission = await hasPermission(req.user.id, 'view:audit_logs');
    
    if (!hasViewPermission) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    
    const { startDate, endDate, resourceType } = req.query;
    
    const filters = {
      startDate,
      endDate,
      resourceType
    };
    
    const stats = await getAuditLogStats(filters);
    
    res.json(stats);
  } catch (error) {
    logger.error('Error getting audit log stats:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/audit/organization/:organizationId/stats
 * @desc    Get audit log statistics for a specific organization
 * @access  Private
 */
router.get('/organization/:organizationId/stats', async (req, res) => {
  try {
    // Check if user has permission to view audit logs
    const hasViewPermission = await hasPermission(req.user.id, 'view:audit_logs');
    
    if (!hasViewPermission) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    
    const organizationId = req.params.organizationId;
    const { startDate, endDate, resourceType } = req.query;
    
    // Get all audit logs for this organization
    const filters = {
      startDate,
      endDate,
      resourceType
    };
    
    // Get organization audit logs first page with large limit
    const auditLogs = await getOrganizationAuditLogs(organizationId, filters, 1, 1000);
    
    // Calculate stats from the audit logs (simplified approach)
    const actionCounts = {};
    const resourceCounts = {};
    const userCounts = {};
    
    auditLogs.logs.forEach(log => {
      // Action counts
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
      
      // Resource counts
      resourceCounts[log.resourceType] = (resourceCounts[log.resourceType] || 0) + 1;
      
      // User counts
      if (log.User) {
        userCounts[log.User.id] = userCounts[log.User.id] || {
          count: 0,
          username: log.User.username,
          email: log.User.email
        };
        userCounts[log.User.id].count++;
      }
    });
    
    // Convert to arrays and sort
    const actionCountsArray = Object.entries(actionCounts).map(([action, count]) => ({ action, count }));
    actionCountsArray.sort((a, b) => b.count - a.count);
    
    const resourceCountsArray = Object.entries(resourceCounts).map(([resourceType, count]) => ({ resourceType, count }));
    resourceCountsArray.sort((a, b) => b.count - a.count);
    
    const userCountsArray = Object.entries(userCounts).map(([userId, data]) => ({
      userId,
      username: data.username,
      email: data.email,
      count: data.count
    }));
    userCountsArray.sort((a, b) => b.count - a.count);
    
    res.json({
      actionCounts: actionCountsArray,
      resourceCounts: resourceCountsArray,
      userCounts: userCountsArray.slice(0, 10), // Limit to top 10
      totalLogs: auditLogs.total
    });
  } catch (error) {
    logger.error('Error getting organization audit log stats:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 