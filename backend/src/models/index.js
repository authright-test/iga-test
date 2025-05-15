import AuditLog from './AuditLog.js';
import Organization from './Organization.js';
import Permission from './Permission.js';
import Policy from './Policy.js';
import Repository from './Repository.js';
import Role from './Role.js';
import Team from './Team.js';
import User from './User.js';

// Define associations
// User <-> Role (Many-to-Many)
User.belongsToMany(Role, { through: 'UserRoles' });
Role.belongsToMany(User, { through: 'UserRoles' });

// Role <-> Permission (Many-to-Many)
Role.belongsToMany(Permission, { through: 'RolePermissions' });
Permission.belongsToMany(Role, { through: 'RolePermissions' });

// Organization <-> User (Many-to-Many)
Organization.belongsToMany(User, { through: 'OrganizationUsers' });
User.belongsToMany(Organization, { through: 'OrganizationUsers' });

// Organization <-> Repository (One-to-Many)
Organization.hasMany(Repository);
Repository.belongsTo(Organization);

// Organization <-> Team (One-to-Many)
Organization.hasMany(Team);
Team.belongsTo(Organization);

// Team <-> User (Many-to-Many)
Team.belongsToMany(User, { through: 'TeamUsers' });
User.belongsToMany(Team, { through: 'TeamUsers' });

// Team <-> Repository (Many-to-Many)
Team.belongsToMany(Repository, { through: 'TeamRepositories', as: 'Repositories' });
Repository.belongsToMany(Team, { through: 'TeamRepositories', as: 'Teams' });

// User <-> AuditLog (One-to-Many)
User.hasMany(AuditLog);
AuditLog.belongsTo(User);

// Organization <-> Policy (Many-to-Many)
Organization.belongsToMany(Policy, { through: 'OrganizationPolicies' });
Policy.belongsToMany(Organization, { through: 'OrganizationPolicies' });

export {
  User,
  Role,
  Permission,
  Organization,
  Repository,
  Team,
  Policy,
  AuditLog
};
