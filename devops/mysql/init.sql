-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS github_access_control;

-- Use the database
USE github_access_control;

-- Create initial roles
INSERT INTO Role (name, description, isSystem, createdAt, updatedAt) 
VALUES 
('Admin', 'Full system access with all permissions', true, NOW(), NOW()),
('Manager', 'Manage users and access policies', true, NOW(), NOW()),
('User', 'Basic user with limited permissions', true, NOW(), NOW()),
('Auditor', 'View-only access for auditing purposes', true, NOW(), NOW())
ON DUPLICATE KEY UPDATE updatedAt = NOW();

-- Create initial permissions
INSERT INTO Permission (name, description, resource, action, createdAt, updatedAt)
VALUES
-- User permissions
('view:users', 'View users', 'user', 'read', NOW(), NOW()),
('create:users', 'Create users', 'user', 'write', NOW(), NOW()),
('update:users', 'Update users', 'user', 'write', NOW(), NOW()),
('delete:users', 'Delete users', 'user', 'write', NOW(), NOW()),

-- Role permissions
('view:roles', 'View roles', 'role', 'read', NOW(), NOW()),
('create:roles', 'Create roles', 'role', 'write', NOW(), NOW()),
('update:roles', 'Update roles', 'role', 'write', NOW(), NOW()),
('delete:roles', 'Delete roles', 'role', 'write', NOW(), NOW()),
('assign:roles', 'Assign roles to users', 'role', 'admin', NOW(), NOW()),

-- Policy permissions
('view:policies', 'View policies', 'policy', 'read', NOW(), NOW()),
('create:policies', 'Create policies', 'policy', 'write', NOW(), NOW()),
('update:policies', 'Update policies', 'policy', 'write', NOW(), NOW()),
('delete:policies', 'Delete policies', 'policy', 'write', NOW(), NOW()),

-- Repository permissions
('view:repositories', 'View repositories', 'repository', 'read', NOW(), NOW()),
('create:repositories', 'Create repositories', 'repository', 'write', NOW(), NOW()),
('update:repositories', 'Update repositories', 'repository', 'write', NOW(), NOW()),
('delete:repositories', 'Delete repositories', 'repository', 'write', NOW(), NOW()),

-- Team permissions
('view:teams', 'View teams', 'team', 'read', NOW(), NOW()),
('create:teams', 'Create teams', 'team', 'write', NOW(), NOW()),
('update:teams', 'Update teams', 'team', 'write', NOW(), NOW()),
('delete:teams', 'Delete teams', 'team', 'write', NOW(), NOW()),

-- Audit log permissions
('view:audit_logs', 'View audit logs', 'audit', 'read', NOW(), NOW()),
('export:audit_logs', 'Export audit logs', 'audit', 'write', NOW(), NOW())
ON DUPLICATE KEY UPDATE updatedAt = NOW();

-- Assign permissions to Admin role
INSERT INTO RolePermissions (createdAt, updatedAt, RoleId, PermissionId)
SELECT NOW(), NOW(), r.id, p.id
FROM Role r, Permission p
WHERE r.name = 'Admin'
ON DUPLICATE KEY UPDATE updatedAt = NOW();

-- Assign permissions to Manager role
INSERT INTO RolePermissions (createdAt, updatedAt, RoleId, PermissionId)
SELECT NOW(), NOW(), r.id, p.id
FROM Role r, Permission p
WHERE r.name = 'Manager' AND p.name IN (
  'view:users', 'create:users', 'update:users',
  'view:roles', 'assign:roles',
  'view:policies', 'create:policies', 'update:policies',
  'view:repositories', 'update:repositories',
  'view:teams', 'create:teams', 'update:teams',
  'view:audit_logs'
)
ON DUPLICATE KEY UPDATE updatedAt = NOW();

-- Assign permissions to User role
INSERT INTO RolePermissions (createdAt, updatedAt, RoleId, PermissionId)
SELECT NOW(), NOW(), r.id, p.id
FROM Role r, Permission p
WHERE r.name = 'User' AND p.name IN (
  'view:users',
  'view:repositories',
  'view:teams'
)
ON DUPLICATE KEY UPDATE updatedAt = NOW();

-- Assign permissions to Auditor role
INSERT INTO RolePermissions (createdAt, updatedAt, RoleId, PermissionId)
SELECT NOW(), NOW(), r.id, p.id
FROM Role r, Permission p
WHERE r.name = 'Auditor' AND p.name IN (
  'view:users',
  'view:roles',
  'view:policies',
  'view:repositories',
  'view:teams',
  'view:audit_logs',
  'export:audit_logs'
)
ON DUPLICATE KEY UPDATE updatedAt = NOW(); 