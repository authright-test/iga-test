import 'dotenv/config';
import { sequelize } from '../models/index.js';
import logger from '../utils/logger.js';
import { User, Organization, Team, Role } from '../models/index.js';

async function check() {

  try {
    logger.info('Starting database health check...');

    // 测试数据库连接
    await sequelize.authenticate();
    logger.info('Database connection established successfully.');

    // 检查各个模型的数据
    const userCount = await User.count();
    const orgCount = await Organization.count();
    const teamCount = await Team.count();
    const roleCount = await Role.count();

    logger.info('Database statistics:');
    logger.info(`- Users: ${userCount}`);
    logger.info(`- Organizations: ${orgCount}`);
    logger.info(`- Teams: ${teamCount}`);
    logger.info(`- Roles: ${roleCount}`);

    // 检查关联关系
    const orgs = await Organization.findAll({
      include: [
        { model: User, as: 'members' },
        { model: Team, as: 'teams' }
      ]
    });

    logger.info('\nOrganization details:');
    for (const org of orgs) {
      logger.info(`\nOrganization: ${org.name}`);
      logger.info(`- Members: ${org.members.length}`);
      logger.info(`- Teams: ${org.teams.length}`);
    }

    logger.info('\nDatabase health check completed successfully.');
  } catch (error) {
    logger.error('Health check failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// 执行检查
check();
