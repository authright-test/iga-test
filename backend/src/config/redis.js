import { createClient } from 'redis';
import logger from '../utils/logger.js';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

export const setupRedis = async () => {
  try {
    await redisClient.connect();
    logger.info('Redis connection has been established successfully.');
  } catch (error) {
    logger.error('Unable to connect to Redis:', error);
    throw error;
  }
};

export { redisClient };
