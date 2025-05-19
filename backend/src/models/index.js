import { sequelize } from '../config/database.js';
import Organization from './Organization.js';
import User from './User.js';
import Team from './Team.js';
import Role from './Role.js';
import Repository from './Repository.js';
import Policy from './Policy.js';
import PolicyRule from './PolicyRule.js';
import AuditLog from './AuditLog.js';
import Permission from './Permission.js';
import RefreshToken from './RefreshToken.js';

// 初始化所有模型
const models = {
  Organization,
  User,
  Team,
  Role,
  Repository,
  Policy,
  PolicyRule,
  AuditLog,
  Permission,
  RefreshToken
};

// 定义模型关联关系
const defineAssociations = () => {
  // Organization 关联
  Organization.belongsToMany(User, {
    through: 'OrganizationMembers',
    as: 'orgUsers',
    foreignKey: 'organizationId',
    otherKey: 'userId'
  });

  Organization.hasMany(Team, {
    as: 'orgTeams',
    foreignKey: 'organizationId'
  });

  Organization.hasMany(Repository, {
    as: 'orgRepos',
    foreignKey: 'organizationId'
  });

  Organization.hasMany(Policy, {
    as: 'orgPolicies',
    foreignKey: 'organizationId'
  });

  Organization.hasMany(AuditLog, {
    as: 'orgAuditLogs',
    foreignKey: 'organizationId'
  });

  // User 关联
  User.belongsToMany(Organization, {
    through: 'OrganizationMembers',
    as: 'userOrgs',
    foreignKey: 'userId',
    otherKey: 'organizationId'
  });

  User.belongsToMany(Team, {
    through: 'TeamMembers',
    as: 'userTeams',
    foreignKey: 'userId',
    otherKey: 'teamId'
  });

  User.belongsToMany(Role, {
    through: 'UserRoles',
    as: 'userRoles',
    foreignKey: 'userId',
    otherKey: 'roleId'
  });

  User.belongsToMany(Permission, {
    through: 'UserPermissions',
    as: 'userPerms',
    foreignKey: 'userId',
    otherKey: 'permissionId'
  });

  User.hasMany(RefreshToken, {
    as: 'userTokens',
    foreignKey: 'userId'
  });

  User.hasMany(AuditLog, {
    as: 'userAuditLogs',
    foreignKey: 'userId'
  });

  // Team 关联
  Team.belongsTo(Organization, {
    as: 'teamOrg',
    foreignKey: 'organizationId'
  });

  Team.belongsToMany(User, {
    through: 'TeamMembers',
    as: 'teamUsers',
    foreignKey: 'teamId',
    otherKey: 'userId'
  });

  Team.belongsToMany(Repository, {
    through: 'TeamRepositories',
    as: 'teamRepos',
    foreignKey: 'teamId',
    otherKey: 'repositoryId'
  });

  Team.belongsToMany(Role, {
    through: 'TeamRoles',
    as: 'teamRoles',
    foreignKey: 'teamId',
    otherKey: 'roleId'
  });

  // Role 关联
  Role.belongsToMany(User, {
    through: 'UserRoles',
    as: 'roleUsers',
    foreignKey: 'roleId',
    otherKey: 'userId'
  });

  Role.belongsToMany(Team, {
    through: 'TeamRoles',
    as: 'roleTeams',
    foreignKey: 'roleId',
    otherKey: 'teamId'
  });

  Role.belongsToMany(Permission, {
    through: 'RolePermissions',
    as: 'rolePerms',
    foreignKey: 'roleId',
    otherKey: 'permissionId'
  });

  // Repository 关联
  Repository.belongsTo(Organization, {
    as: 'repoOrg',
    foreignKey: 'organizationId'
  });

  Repository.belongsToMany(Team, {
    through: 'TeamRepositories',
    as: 'repoTeams',
    foreignKey: 'repositoryId',
    otherKey: 'teamId'
  });

  Repository.hasMany(Policy, {
    as: 'repoPolicies',
    foreignKey: 'repositoryId'
  });

  // Policy 关联
  Policy.belongsTo(Organization, {
    as: 'policyOrg',
    foreignKey: 'organizationId'
  });

  Policy.belongsTo(Repository, {
    as: 'policyRepo',
    foreignKey: 'repositoryId'
  });

  Policy.hasMany(PolicyRule, {
    as: 'policyRules',
    foreignKey: 'policyId'
  });

  // PolicyRule 关联
  PolicyRule.belongsTo(Policy, {
    as: 'rulePolicy',
    foreignKey: 'policyId'
  });

  // Permission 关联
  Permission.belongsToMany(User, {
    through: 'UserPermissions',
    as: 'permUsers',
    foreignKey: 'permissionId',
    otherKey: 'userId'
  });

  Permission.belongsToMany(Role, {
    through: 'RolePermissions',
    as: 'permRoles',
    foreignKey: 'permissionId',
    otherKey: 'roleId'
  });

  // RefreshToken 关联
  RefreshToken.belongsTo(User, {
    as: 'tokenUser',
    foreignKey: 'userId'
  });

  // AuditLog 关联
  AuditLog.belongsTo(User, {
    as: 'logUser',
    foreignKey: 'userId'
  });

  AuditLog.belongsTo(Organization, {
    as: 'logOrg',
    foreignKey: 'organizationId'
  });
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
  PolicyRule,
  AuditLog,
  Permission,
  RefreshToken
};
