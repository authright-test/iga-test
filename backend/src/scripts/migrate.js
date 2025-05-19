import 'dotenv/config';
import { sequelize } from '../models/index.js';
import logger from '../utils/logger.js';

async function migrate() {
  import { sequelize } from '../config/database.js';

  try {
    logger.info('Starting database migration...');

    // 测试数据库连接
    await sequelize.authenticate();
    logger.info('Database connection established successfully.');

    // 运行所有迁移
    await sequelize.sync({ alter: true });
    logger.info('Database migration completed successfully.');
  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// 执行迁移
migrate();
