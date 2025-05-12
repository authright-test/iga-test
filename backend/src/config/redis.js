const { createClient } = require('redis');
const logger = require('../utils/logger');

const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
  password: process.env.REDIS_PASSWORD
});

async function setupRedis() {
  try {
    await redisClient.connect();
    logger.info('Redis connection has been established successfully.');
  } catch (error) {
    logger.error('Unable to connect to Redis:', error);
    throw error;
  }
}

redisClient.on('error', (err) => {
  logger.error('Redis Client Error:', err);
});

module.exports = {
  redisClient,
  setupRedis
}; 