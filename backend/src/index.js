import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import { setupDatabase } from './config/database.js';
import { setupRedis } from './config/redis.js';
import { setupRoutes } from './routes/index.js';
import logger from './utils/logger.js';
import { setupWebhooks } from './webhooks/index.js';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import { authenticate } from './middleware/auth.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import roleRoutes from './routes/roleRoutes.js';
import repositoryRoutes from './routes/repositoryRoutes.js';
import policyRoutes from './routes/policyRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import accessViolationRoutes from './routes/accessViolationRoutes.js';
import securityStatsRoutes from './routes/securityStatsRoutes.js';
import accessRequestRoutes from './routes/accessRequestRoutes.js';

// Configure environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));

// Setup routes
setupRoutes(app);

// Setup webhooks
setupWebhooks(app);

// Static files
app.use(express.static(join(__dirname, 'public')));

// Apply authentication middleware to all API routes
app.use('/api', authenticate);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/repositories', repositoryRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/violations', accessViolationRoutes);
app.use('/api/stats', securityStatsRoutes);
app.use('/api/requests', accessRequestRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
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