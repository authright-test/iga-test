const express = require('express');
const { authenticateJWT } = require('../middleware/authMiddleware');
const { AuditLog, User, sequelize } = require('../models');
const { Op } = require('sequelize');
const router = express.Router();

// 获取组织的审计日志
router.get('/organization/:organizationId/logs', authenticateJWT, async (req, res) => {
  try {
    const { organizationId } = req.params;
    const { 
      page = 1, 
      limit = 20, 
      action, 
      resourceType, 
      startDate, 
      endDate, 
      searchTerm 
    } = req.query;

    // 检查用户是否有权限访问该组织的审计日志
    if (!req.user.organizationId || req.user.organizationId.toString() !== organizationId) {
      return res.status(403).json({ error: 'You do not have permission to access audit logs for this organization' });
    }

    // 构建查询条件
    const whereClause = { organizationId };
    
    if (action) {
      whereClause.action = action;
    }
    
    if (resourceType) {
      whereClause.resourceType = resourceType;
    }
    
    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      whereClause.createdAt = {
        [Op.gte]: new Date(startDate)
      };
    } else if (endDate) {
      whereClause.createdAt = {
        [Op.lte]: new Date(endDate)
      };
    }
    
    if (searchTerm) {
      whereClause[Op.or] = [
        { resourceId: { [Op.like]: `%${searchTerm}%` } },
        { action: { [Op.like]: `%${searchTerm}%` } },
        { resourceType: { [Op.like]: `%${searchTerm}%` } },
        sequelize.literal(`JSON_EXTRACT(details, '$.*') LIKE '%${searchTerm}%'`)
      ];
    }

    // 计算分页
    const offset = (page - 1) * limit;
    
    // 查询审计日志总数
    const total = await AuditLog.count({ where: whereClause });
    
    // 查询审计日志
    const logs = await AuditLog.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'email']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    return res.json({
      logs,
      totalLogs: total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (err) {
    console.error('Error fetching audit logs:', err);
    return res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// 获取组织审计日志的统计信息
router.get('/organization/:organizationId/stats', authenticateJWT, async (req, res) => {
  try {
    const { organizationId } = req.params;

    // 检查用户是否有权限访问该组织的审计日志统计
    if (!req.user.organizationId || req.user.organizationId.toString() !== organizationId) {
      return res.status(403).json({ error: 'You do not have permission to access audit stats for this organization' });
    }

    // 获取总日志数
    const totalLogs = await AuditLog.count({ where: { organizationId } });

    // 获取各种操作的计数
    const actionCounts = await AuditLog.findAll({
      attributes: [
        'action',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: { organizationId },
      group: ['action'],
      order: [[sequelize.literal('count'), 'DESC']],
      limit: 5
    });

    // 获取各种资源类型的计数
    const resourceCounts = await AuditLog.findAll({
      attributes: [
        'resourceType',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: { organizationId },
      group: ['resourceType'],
      order: [[sequelize.literal('count'), 'DESC']],
      limit: 5
    });

    // 获取用户操作计数（最活跃的用户）
    const userCounts = await AuditLog.findAll({
      attributes: [
        'userId',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: { 
        organizationId,
        userId: { [Op.not]: null } 
      },
      include: [
        {
          model: User,
          attributes: ['username']
        }
      ],
      group: ['userId', 'User.id', 'User.username'],
      order: [[sequelize.literal('count'), 'DESC']],
      limit: 5
    });

    // 处理结果
    const formattedUserCounts = userCounts.map(item => ({
      userId: item.userId,
      username: item.User ? item.User.username : 'Unknown',
      count: parseInt(item.dataValues.count)
    }));

    return res.json({
      totalLogs,
      actionCounts: actionCounts.map(item => ({
        action: item.action,
        count: parseInt(item.dataValues.count)
      })),
      resourceCounts: resourceCounts.map(item => ({
        resourceType: item.resourceType,
        count: parseInt(item.dataValues.count)
      })),
      userCounts: formattedUserCounts
    });
  } catch (err) {
    console.error('Error fetching audit stats:', err);
    return res.status(500).json({ error: 'Failed to fetch audit statistics' });
  }
});

// 创建审计日志
router.post('/organization/:organizationId/logs', authenticateJWT, async (req, res) => {
  try {
    const { organizationId } = req.params;
    const { action, resourceType, resourceId, details } = req.body;
    
    // 检查用户是否有权限为该组织创建审计日志
    if (!req.user.organizationId || req.user.organizationId.toString() !== organizationId) {
      return res.status(403).json({ error: 'You do not have permission to create audit logs for this organization' });
    }
    
    // 验证必填字段
    if (!action || !resourceType || !resourceId) {
      return res.status(400).json({ error: 'Missing required fields: action, resourceType, resourceId' });
    }
    
    // 创建审计日志记录
    const auditLog = await AuditLog.create({
      userId: req.user.id,
      organizationId,
      action,
      resourceType,
      resourceId,
      details: details || {}
    });
    
    return res.status(201).json({ 
      message: 'Audit log created successfully', 
      id: auditLog.id 
    });
  } catch (err) {
    console.error('Error creating audit log:', err);
    return res.status(500).json({ error: 'Failed to create audit log' });
  }
});

// 记录审计日志的辅助函数
const logAuditEvent = async (options) => {
  try {
    const { 
      userId = null, 
      organizationId, 
      action, 
      resourceType, 
      resourceId, 
      details = {} 
    } = options;

    // 创建审计日志记录
    await AuditLog.create({
      userId,
      organizationId,
      action,
      resourceType,
      resourceId,
      details
    });

    return true;
  } catch (err) {
    console.error('Error creating audit log:', err);
    return false;
  }
};

module.exports = { router, logAuditEvent }; 