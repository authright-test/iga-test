-- 创建数据库
CREATE DATABASE IF NOT EXISTS github_access_control;
USE github_access_control;

-- 创建用户表
CREATE TABLE IF NOT EXISTS Users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    avatarUrl VARCHAR(255),
    githubId VARCHAR(255) UNIQUE,
    githubToken VARCHAR(255),
    isActive BOOLEAN DEFAULT true,
    lastLoginAt DATETIME,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_github_id (githubId),
    INDEX idx_email (email)
);

-- 创建组织表
CREATE TABLE IF NOT EXISTS Organizations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    githubOrgId VARCHAR(255) UNIQUE,
    description TEXT,
    avatarUrl VARCHAR(255),
    isActive BOOLEAN DEFAULT true,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_github_org_id (githubOrgId)
);

-- 创建仓库表
CREATE TABLE IF NOT EXISTS Repositories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    fullName VARCHAR(255) NOT NULL,
    githubRepoId VARCHAR(255) UNIQUE,
    description TEXT,
    isPrivate BOOLEAN DEFAULT false,
    OrganizationId INT NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (OrganizationId) REFERENCES Organizations(id) ON DELETE CASCADE,
    INDEX idx_github_repo_id (githubRepoId),
    INDEX idx_org_id (OrganizationId)
);

-- 创建团队表
CREATE TABLE IF NOT EXISTS Teams (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    githubTeamId VARCHAR(255) UNIQUE,
    OrganizationId INT NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (OrganizationId) REFERENCES Organizations(id) ON DELETE CASCADE,
    INDEX idx_github_team_id (githubTeamId),
    INDEX idx_org_id (OrganizationId)
);

-- 创建角色表
CREATE TABLE IF NOT EXISTS Roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    OrganizationId INT NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (OrganizationId) REFERENCES Organizations(id) ON DELETE CASCADE,
    UNIQUE KEY unique_role_org (name, OrganizationId),
    INDEX idx_org_id (OrganizationId)
);

-- 创建权限表
CREATE TABLE IF NOT EXISTS Permissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_permission_name (name)
);

-- 创建策略表
CREATE TABLE IF NOT EXISTS Policies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL,
    rules JSON NOT NULL,
    OrganizationId INT NOT NULL,
    isActive BOOLEAN DEFAULT true,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (OrganizationId) REFERENCES Organizations(id) ON DELETE CASCADE,
    INDEX idx_org_id (OrganizationId),
    INDEX idx_type (type)
);

-- 创建审计日志表
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    UserId INT,
    OrganizationId INT NOT NULL,
    RepositoryId INT,
    TeamId INT,
    type VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    resourceType VARCHAR(50) NOT NULL,
    resourceId VARCHAR(255) NOT NULL,
    details JSON,
    ipAddress VARCHAR(255),
    userAgent VARCHAR(255),
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (UserId) REFERENCES Users(id) ON DELETE SET NULL,
    FOREIGN KEY (OrganizationId) REFERENCES Organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (RepositoryId) REFERENCES Repositories(id) ON DELETE SET NULL,
    FOREIGN KEY (TeamId) REFERENCES Teams(id) ON DELETE SET NULL,
    INDEX audit_organization_idx (OrganizationId),
    INDEX audit_user_idx (UserId),
    INDEX audit_repository_idx (RepositoryId),
    INDEX audit_team_idx (TeamId),
    INDEX audit_resource_type_idx (resourceType),
    INDEX audit_action_idx (action),
    INDEX audit_created_at_idx (createdAt)
);

-- 创建用户-组织关联表
CREATE TABLE IF NOT EXISTS UserOrganizations (
    UserId INT NOT NULL,
    OrganizationId INT NOT NULL,
    role VARCHAR(50) NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (UserId, OrganizationId),
    FOREIGN KEY (UserId) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (OrganizationId) REFERENCES Organizations(id) ON DELETE CASCADE,
    INDEX idx_user_id (UserId),
    INDEX idx_org_id (OrganizationId)
);

-- 创建用户-团队关联表
CREATE TABLE IF NOT EXISTS UserTeams (
    UserId INT NOT NULL,
    TeamId INT NOT NULL,
    role VARCHAR(50) NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (UserId, TeamId),
    FOREIGN KEY (UserId) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (TeamId) REFERENCES Teams(id) ON DELETE CASCADE,
    INDEX idx_user_id (UserId),
    INDEX idx_team_id (TeamId)
);

-- 创建角色-权限关联表
CREATE TABLE IF NOT EXISTS RolePermissions (
    RoleId INT NOT NULL,
    PermissionId INT NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (RoleId, PermissionId),
    FOREIGN KEY (RoleId) REFERENCES Roles(id) ON DELETE CASCADE,
    FOREIGN KEY (PermissionId) REFERENCES Permissions(id) ON DELETE CASCADE,
    INDEX idx_role_id (RoleId),
    INDEX idx_permission_id (PermissionId)
);

-- 创建用户-角色关联表
CREATE TABLE IF NOT EXISTS UserRoles (
    UserId INT NOT NULL,
    RoleId INT NOT NULL,
    OrganizationId INT NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (UserId, RoleId, OrganizationId),
    FOREIGN KEY (UserId) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (RoleId) REFERENCES Roles(id) ON DELETE CASCADE,
    FOREIGN KEY (OrganizationId) REFERENCES Organizations(id) ON DELETE CASCADE,
    INDEX idx_user_id (UserId),
    INDEX idx_role_id (RoleId),
    INDEX idx_org_id (OrganizationId)
);

-- 创建团队-仓库关联表
CREATE TABLE IF NOT EXISTS TeamRepositories (
    TeamId INT NOT NULL,
    RepositoryId INT NOT NULL,
    permission VARCHAR(50) NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (TeamId, RepositoryId),
    FOREIGN KEY (TeamId) REFERENCES Teams(id) ON DELETE CASCADE,
    FOREIGN KEY (RepositoryId) REFERENCES Repositories(id) ON DELETE CASCADE,
    INDEX idx_team_id (TeamId),
    INDEX idx_repo_id (RepositoryId)
);

-- 插入基础权限数据
INSERT INTO Permissions (name, description) VALUES
('read', '读取权限'),
('write', '写入权限'),
('admin', '管理员权限'),
('manage_users', '用户管理权限'),
('manage_teams', '团队管理权限'),
('manage_repositories', '仓库管理权限'),
('manage_policies', '策略管理权限'),
('view_audit_logs', '查看审计日志权限'),
('manage_roles', '角色管理权限');

-- 创建触发器：更新审计日志的更新时间
DELIMITER //
CREATE TRIGGER update_audit_log_timestamp
BEFORE UPDATE ON audit_logs
FOR EACH ROW
BEGIN
    SET NEW.updatedAt = CURRENT_TIMESTAMP;
END//
DELIMITER ; 