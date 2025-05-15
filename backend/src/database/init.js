import fs from 'fs';
import path from 'path';
import { sequelize } from '../config/database.js';
import logger from '../utils/logger.js';

async function initializeDatabase() {
  try {
    // 读取 SQL 文件
    const sqlFile = path.join(__dirname, 'init.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // 执行 SQL 语句
    await sequelize.query(sql);

    logger.info('Database initialized successfully');
  } catch (error) {
    logger.error('Error initializing database:', error);
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      logger.info('Database initialization completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Database initialization failed:', error);
      process.exit(1);
    });
}

export { initializeDatabase }; 