import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { createServer } from 'http';
import { specs } from './config/swagger';
import prisma from './lib/prisma';
import RealtimeService from './services/realtime.service';

import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { authMiddleware } from './middleware/auth';
import { auditMiddleware } from './middleware/audit';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import companyRoutes from './routes/companies';
import publicationRoutes from './routes/publications';
import mediaChannelRoutes from './routes/mediaChannels';
import dataParameterRoutes from './routes/dataParameters';
import dataEntryRoutes from './routes/dataEntries';
import editorialRoutes from './routes/editorials';
import swotAnalysisRoutes from './routes/swotAnalysis';
import dailyMentionRoutes from './routes/dailyMentions';
import analyticsRoutes from './routes/analytics';
import fileUploadRoutes from './routes/fileUploads';
import auditLogRoutes from './routes/auditLogs';
import exportRoutes from './routes/export';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;

// Initialize real-time service
const realtimeService = new RealtimeService(server);

// Swagger configuration is imported from config/swagger.ts

// Rate limiting - more permissive for development
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000'), // Increased to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting in development for localhost
    if (process.env.NODE_ENV === 'development') {
      const ip = req.ip || req.connection.remoteAddress;
      return ip === '127.0.0.1' || ip === '::1' || ip?.includes('localhost');
    }
    return false;
  },
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(limiter);
app.use(morgan('combined'));
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // In development, allow all localhost origins
    if (process.env.NODE_ENV === 'development') {
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
    }

    // Allowed origins
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:8080',
      'http://localhost:3000',
      'http://localhost:4173',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:8080',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:4173',
      process.env.CORS_ORIGIN
    ].filter(Boolean);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Cache-Control',
    'X-File-Name'
  ],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
  preflightContinue: false,
}));

// Handle preflight requests explicitly
app.options('*', (req, res) => {
  const origin = req.headers.origin;

  // In development, allow all localhost origins
  if (process.env.NODE_ENV === 'development' && origin) {
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      res.header('Access-Control-Allow-Origin', origin);
    }
  } else if (origin) {
    // Check against allowed origins
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:8080',
      'http://localhost:3000',
      'http://localhost:4173',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:8080',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:4173',
      process.env.CORS_ORIGIN
    ].filter(Boolean);

    if (allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
    }
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, X-File-Name');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours
  res.sendStatus(200);
});
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// API Documentation
if (process.env.API_DOCS_ENABLED === 'true') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
}

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Media Monitoring Dashboard API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      docs: '/api-docs',
      api: '/api',
    },
  });
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      services: {
        database: 'connected',
        api: 'running',
      },
      version: '1.0.0',
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      services: {
        database: 'disconnected',
        api: 'running',
      },
      error: 'Database connection failed',
    });
  }
});

// Favicon handler
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

// Test endpoint
app.get('/test', (req, res) => {
  res.status(200).json({
    message: 'Server is working correctly!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authMiddleware, auditMiddleware, userRoutes);
app.use('/api/companies', authMiddleware, auditMiddleware, companyRoutes);
app.use('/api/publications', authMiddleware, auditMiddleware, publicationRoutes);
app.use('/api/media-channels', authMiddleware, auditMiddleware, mediaChannelRoutes);
app.use('/api/data-parameters', authMiddleware, auditMiddleware, dataParameterRoutes);
app.use('/api/data-entries', authMiddleware, auditMiddleware, dataEntryRoutes);
app.use('/api/editorials', authMiddleware, auditMiddleware, editorialRoutes);
app.use('/api/swot-analysis', authMiddleware, auditMiddleware, swotAnalysisRoutes);
app.use('/api/daily-mentions', authMiddleware, auditMiddleware, dailyMentionRoutes);
app.use('/api/analytics', authMiddleware, analyticsRoutes);
app.use('/api/files', authMiddleware, auditMiddleware, fileUploadRoutes);
app.use('/api/audit-logs', authMiddleware, auditLogRoutes);
app.use('/api/export', authMiddleware, auditMiddleware, exportRoutes);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log(`⚡ Real-time WebSocket service enabled`);
});

// Export both app and realtime service for use in other modules
export default app;
export { realtimeService };
