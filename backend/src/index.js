import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import { setupDatabase } from './config/database.js';
import { setupRedis } from './config/redis.js';
import { setupRoutes } from './routes/index.js';
import logger from './utils/logger.js';
import { setupWebhooks } from './webhooks/index.js';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Setup routes
setupRoutes(app);

// Setup webhooks
setupWebhooks(app);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
async function startServer() {
  try {
    // Initialize database
    // await setupDatabase();

    // Initialize Redis
    await setupRedis();

    app.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
