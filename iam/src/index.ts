import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { config } from './config';
import { database } from './database';
import { redisClient } from './redis';
import { authRoutes } from './routes/auth';
import { userRoutes } from './routes/users';
import { groupRoutes } from './routes/groups';
import { roleRoutes } from './routes/roles';
import { permissionRoutes } from './routes/permissions';
import { auditRoutes } from './routes/audit';
import { eventService } from './services/eventService';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:3001',
    'http://localhost:3000',
    process.env.FRONTEND_URL || 'http://localhost:3001'
  ],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/authorize', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/audit-logs', auditRoutes);

// Error handling
app.use(errorHandler);

async function start() {
  try {
    // Connect to database
    await database.connect();
    logger.info('Connected to database');

    // Connect to Redis
    await redisClient.connect();
    logger.info('Connected to Redis');

    // Start event consumer
    eventService.startConsumer();
    logger.info('Event consumer started');

    // Start server
    const port = config.port;
    app.listen(port, () => {
      logger.info(`IAM service running on port ${port}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await database.close();
  await redisClient.quit();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await database.close();
  await redisClient.quit();
  process.exit(0);
});

start();