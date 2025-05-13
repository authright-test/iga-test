module.exports = (sequelize, DataTypes) => {
  const AuditLog = sequelize.define('AuditLog', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true, // 允许系统操作没有用户ID
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    organizationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Organizations',
        key: 'id'
      }
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
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'audit_logs',
    indexes: [
      {
        name: 'audit_organization_idx',
        fields: ['organizationId']
      },
      {
        name: 'audit_user_idx',
        fields: ['userId']
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

  AuditLog.associate = function(models) {
    // 关联到用户
    AuditLog.belongsTo(models.User, {
      foreignKey: 'userId',
      onDelete: 'SET NULL' // 如果用户被删除，审计日志仍然保留
    });

    // 关联到组织
    AuditLog.belongsTo(models.Organization, {
      foreignKey: 'organizationId',
      onDelete: 'CASCADE' // 如果组织被删除，相关审计日志也会被删除
    });
  };

  return AuditLog;
};