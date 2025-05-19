import { sequelize } from '../config/database.js';
import Organization from './Organization.js';
import User from './User.js';
import Team from './Team.js';
import Role from './Role.js';
import Repository from './Repository.js';
import Policy from './Policy.js';
import AuditLog from './AuditLog.js';
import Permission from './Permission.js';
import RefreshToken from './RefreshToken.js';

// 定义模型关联关系
const defineAssociations = () => {
  // Organization 关联
  Organization.associate = (models) => {
    // 组织与用户的多对多关系
    Organization.belongsToMany(models.User, {
      through: 'OrganizationMembers',
      as: 'members',
      foreignKey: 'organizationId',
      otherKey: 'userId'
    });

    // 组织与团队的一对多关系
    Organization.hasMany(models.Team, {
      as: 'teams',
      foreignKey: 'organizationId'
    });

    // 组织与仓库的一对多关系
    Organization.hasMany(models.Repository, {
      as: 'repositories',
      foreignKey: 'organizationId'
    });

    // 组织与策略的一对多关系
    Organization.hasMany(models.Policy, {
      as: 'policies',
      foreignKey: 'organizationId'
    });

    // 组织与审计日志的一对多关系
    Organization.hasMany(models.AuditLog, {
      as: 'auditLogs',
      foreignKey: 'organizationId'
    });
  };

  // User 关联
  User.associate = (models) => {
    // 用户与组织的多对多关系
    User.belongsToMany(models.Organization, {
      through: 'OrganizationMembers',
      as: 'organizations',
      foreignKey: 'userId',
      otherKey: 'organizationId'
    });

    // 用户与团队的多对多关系
    User.belongsToMany(models.Team, {
      through: 'TeamMembers',
      as: 'teams',
      foreignKey: 'userId',
      otherKey: 'teamId'
    });

    // 用户与角色的多对多关系
    User.belongsToMany(models.Role, {
      through: 'UserRoles',
      as: 'roles',
      foreignKey: 'userId',
      otherKey: 'roleId'
    });

    // 用户与权限的多对多关系
    User.belongsToMany(models.Permission, {
      through: 'UserPermissions',
      as: 'permissions',
      foreignKey: 'userId',
      otherKey: 'permissionId'
    });

    // 用户与刷新令牌的一对多关系
    User.hasMany(models.RefreshToken, {
      as: 'refreshTokens',
      foreignKey: 'userId'
    });

    // 用户与审计日志的一对多关系
    User.hasMany(models.AuditLog, {
      as: 'auditLogs',
      foreignKey: 'userId'
    });
  };

  // Team 关联
  Team.associate = (models) => {
    // 团队与组织的关系
    Team.belongsTo(models.Organization, {
      as: 'organization',
      foreignKey: 'organizationId'
    });

    // 团队与用户的多对多关系
    Team.belongsToMany(models.User, {
      through: 'TeamMembers',
      as: 'members',
      foreignKey: 'teamId',
      otherKey: 'userId'
    });

    // 团队与仓库的多对多关系
    Team.belongsToMany(models.Repository, {
      through: 'TeamRepositories',
      as: 'repositories',
      foreignKey: 'teamId',
      otherKey: 'repositoryId'
    });

    // 团队与角色的多对多关系
    Team.belongsToMany(models.Role, {
      through: 'TeamRoles',
      as: 'roles',
      foreignKey: 'teamId',
      otherKey: 'roleId'
    });
  };

  // Role 关联
  Role.associate = (models) => {
    // 角色与用户的多对多关系
    Role.belongsToMany(models.User, {
      through: 'UserRoles',
      as: 'users',
      foreignKey: 'roleId',
      otherKey: 'userId'
    });

    // 角色与团队的多对多关系
    Role.belongsToMany(models.Team, {
      through: 'TeamRoles',
      as: 'teams',
      foreignKey: 'roleId',
      otherKey: 'teamId'
    });

    // 角色与权限的多对多关系
    Role.belongsToMany(models.Permission, {
      through: 'RolePermissions',
      as: 'permissions',
      foreignKey: 'roleId',
      otherKey: 'permissionId'
    });
  };

  // Repository 关联
  Repository.associate = (models) => {
    // 仓库与组织的关系
    Repository.belongsTo(models.Organization, {
      as: 'organization',
      foreignKey: 'organizationId'
    });

    // 仓库与团队的多对多关系
    Repository.belongsToMany(models.Team, {
      through: 'TeamRepositories',
      as: 'teams',
      foreignKey: 'repositoryId',
      otherKey: 'teamId'
    });

    // 仓库与策略的一对多关系
    Repository.hasMany(models.Policy, {
      as: 'policies',
      foreignKey: 'repositoryId'
    });
  };

  // Policy 关联
  Policy.associate = (models) => {
    // 策略与组织的关系
    Policy.belongsTo(models.Organization, {
      as: 'organization',
      foreignKey: 'organizationId'
    });

    // 策略与仓库的关系
    Policy.belongsTo(models.Repository, {
      as: 'repository',
      foreignKey: 'repositoryId'
    });
  };

  // Permission 关联
  Permission.associate = (models) => {
    // 权限与用户的多对多关系
    Permission.belongsToMany(models.User, {
      through: 'UserPermissions',
      as: 'users',
      foreignKey: 'permissionId',
      otherKey: 'userId'
    });

    // 权限与角色的多对多关系
    Permission.belongsToMany(models.Role, {
      through: 'RolePermissions',
      as: 'roles',
      foreignKey: 'permissionId',
      otherKey: 'roleId'
    });
  };

  // RefreshToken 关联
  RefreshToken.associate = (models) => {
    // 刷新令牌与用户的关系
    RefreshToken.belongsTo(models.User, {
      as: 'user',
      foreignKey: 'userId'
    });
  };

  // AuditLog 关联
  AuditLog.associate = (models) => {
    // 审计日志与用户的关系
    AuditLog.belongsTo(models.User, {
      as: 'user',
      foreignKey: 'userId'
    });

    // 审计日志与组织的关系
    AuditLog.belongsTo(models.Organization, {
      as: 'organization',
      foreignKey: 'organizationId'
    });
  };
};

// 初始化所有模型
const models = {
  Organization,
  User,
  Team,
  Role,
  Repository,
  Policy,
  AuditLog,
  Permission,
  RefreshToken
};

// 定义所有关联关系
defineAssociations();

export {
  sequelize,
  Organization,
  User,
  Team,
  Role,
  Repository,
  Policy,
  AuditLog,
  Permission,
  RefreshToken
};
