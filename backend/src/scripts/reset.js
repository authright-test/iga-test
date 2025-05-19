import 'dotenv/config';
import { sequelize } from '../models/index.js';
import logger from '../utils/logger.js';

async function resetDatabase() {
  try {
    logger.info('Starting database reset...');

    // 获取所有模型
    const models = Object.values(sequelize.models);

    // 禁用外键约束
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

    // 删除所有表
    for (const model of models) {
      logger.info(`Dropping table: ${model.tableName}`);
      await model.drop({ force: true });
    }

    // 同步所有模型（创建表）
    logger.info('Creating tables...');
    await sequelize.sync({ force: true });

    // 启用外键约束
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

    logger.info('Database reset completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Error resetting database:', error);
    process.exit(1);
  }
}

// 执行重置
resetDatabase();
