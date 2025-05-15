import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  UserId: {
    type: DataTypes.INTEGER,
    allowNull: true, // 允许系统操作没有用户ID
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  OrganizationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Organizations',
      key: 'id'
    }
  },
  RepositoryId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Repositories',
      key: 'id'
    }
  },
  TeamId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Teams',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '访问类型，例如: repository_access, team_access'
  },
  action: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '执行的操作，例如: repository_created, member_added, policy_enforced'
  },
  resourceType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '资源类型，例如: repository, user, team, organization, policy, role'
  },
  resourceId: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: '资源的标识符，可能是ID或名称'
  },
  details: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '操作的详细信息，例如修改前后的值、额外上下文等'
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: '操作者的IP地址'
  },
  userAgent: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: '操作者的用户代理信息'
  }
}, {
  tableName: 'audit_logs',
  timestamps: true,
  indexes: [
    {
      name: 'audit_organization_idx',
      fields: ['OrganizationId']
    },
    {
      name: 'audit_user_idx',
      fields: ['UserId']
    },
    {
      name: 'audit_repository_idx',
      fields: ['RepositoryId']
    },
    {
      name: 'audit_team_idx',
      fields: ['TeamId']
    },
    {
      name: 'audit_resource_type_idx',
      fields: ['resourceType']
    },
    {
      name: 'audit_action_idx',
      fields: ['action']
    },
    {
      name: 'audit_created_at_idx',
      fields: ['createdAt']
    }
  ]
});

// 定义模型关联
AuditLog.associate = function(models) {
  // 关联到用户
  AuditLog.belongsTo(models.User, {
    foreignKey: 'UserId',
    onDelete: 'SET NULL' // 如果用户被删除，审计日志仍然保留
  });

  // 关联到组织
  AuditLog.belongsTo(models.Organization, {
    foreignKey: 'OrganizationId',
    onDelete: 'CASCADE' // 如果组织被删除，相关审计日志也会被删除
  });

  // 关联到仓库
  AuditLog.belongsTo(models.Repository, {
    foreignKey: 'RepositoryId',
    onDelete: 'SET NULL'
  });

  // 关联到团队
  AuditLog.belongsTo(models.Team, {
    foreignKey: 'TeamId',
    onDelete: 'SET NULL'
  });
};

export default AuditLog; 