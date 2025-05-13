# 数据库初始化说明

## 概述

本项目使用 MySQL 数据库，数据库初始化脚本位于 `backend/src/database` 目录下。初始化脚本包含数据库创建、表结构定义、基础数据插入等功能。

## 数据库结构

数据库包含以下主要表：

1. **Users** - 用户信息表
   - 存储用户基本信息
   - 包含 GitHub 集成相关字段

2. **Organizations** - 组织信息表
   - 存储组织基本信息
   - 关联 GitHub 组织

3. **Repositories** - 仓库信息表
   - 存储仓库基本信息
   - 关联组织和 GitHub 仓库

4. **Teams** - 团队信息表
   - 存储团队基本信息
   - 关联组织和 GitHub 团队

5. **Roles** - 角色表
   - 定义组织内的角色
   - 包含角色权限配置

6. **Permissions** - 权限表
   - 定义系统权限
   - 预置基础权限数据

7. **Policies** - 策略表
   - 存储访问控制策略
   - 支持 JSON 格式的规则配置

8. **audit_logs** - 审计日志表
   - 记录系统操作日志
   - 支持多维度查询

## 关联表

系统包含以下关联表：

- UserOrganizations - 用户-组织关联
- UserTeams - 用户-团队关联
- RolePermissions - 角色-权限关联
- UserRoles - 用户-角色关联
- TeamRepositories - 团队-仓库关联

## 初始化方法

### 方法一：使用 SQL 文件

```bash
# 使用 MySQL 命令行工具
mysql -u username -p < backend/src/database/init.sql
```

### 方法二：使用 Node.js 脚本

```bash
# 直接运行初始化脚本
node backend/src/database/init.js
```

### 方法三：在应用启动时初始化

```javascript
const initializeDatabase = require('./database/init');
await initializeDatabase();
```

## 数据库配置

在初始化之前，请确保：

1. 已安装 MySQL 数据库（推荐 8.0 或以上版本）
2. 已创建数据库用户并授予相应权限
3. 已正确配置数据库连接信息（在 `config/database.js` 中）

## 注意事项

1. 初始化脚本会创建数据库（如果不存在）
2. 所有表都包含 `createdAt` 和 `updatedAt` 时间戳
3. 外键约束确保数据完整性
4. 索引优化确保查询性能
5. 审计日志表包含自动更新时间戳的触发器

## 基础数据

初始化脚本会自动插入以下基础数据：

- 基础权限数据（read, write, admin 等）
- 系统必要的配置数据

## 数据备份

建议在初始化之前备份现有数据：

```bash
# 备份数据库
mysqldump -u username -p github_access_control > backup.sql

# 恢复数据库
mysql -u username -p github_access_control < backup.sql
```

## 故障排除

如果遇到初始化问题：

1. 检查数据库连接配置
2. 确保数据库用户有足够权限
3. 查看错误日志获取详细信息
4. 确保 MySQL 版本兼容

## 维护建议

1. 定期备份数据库
2. 监控数据库性能
3. 及时更新数据库版本
4. 定期检查索引使用情况
5. 维护审计日志表的大小 