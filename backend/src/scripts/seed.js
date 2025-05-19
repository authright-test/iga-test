import 'dotenv/config';
import { sequelize } from '../models/index.js';
import logger from '../utils/logger.js';
import { User, Organization, Team, Role } from '../models/index.js';
import bcrypt from 'bcryptjs';

async function seed() {

  try {
    logger.info('Starting database seeding...');

    // 测试数据库连接
    await sequelize.authenticate();
    logger.info('Database connection established successfully.');

    // 创建测试用户
    const adminUser = await User.create({
      githubId: '123456',
      login: 'admin',
      name: 'Admin User',
      email: 'admin@example.com',
      password: await bcrypt.hash('admin123', 10),
      isActive: true
    });

    // 创建测试组织
    const testOrg = await Organization.create({
      githubId: '789012',
      name: 'Test Organization',
      login: 'test-org',
      description: 'A test organization',
      installationId: 123456,
      plan: 'free',
      status: 'active',
      isActive: true
    });

    // 创建测试团队
    const adminTeam = await Team.create({
      name: 'Administrators',
      description: 'Organization administrators',
      organizationId: testOrg.id,
      isActive: true
    });

    // 创建测试角色
    const adminRole = await Role.create({
      name: 'admin',
      description: 'Administrator role',
      permissions: ['*'],
      isActive: true
    });

    // 建立关联关系
    await testOrg.addMember(adminUser);
    await adminTeam.addMember(adminUser);
    await adminUser.addRole(adminRole);

    logger.info('Database seeding completed successfully.');
  } catch (error) {
    logger.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// 执行种子
seed();
