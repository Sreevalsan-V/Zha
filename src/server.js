const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');

const config = require('./config/config');
const db = require('./models');
const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

// Security middleware - configured for local development with HTTP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Allow inline scripts for HTML pages
      imgSrc: ["'self'", "data:"],
      upgradeInsecureRequests: null, // Explicitly disable HTTPS upgrade for HTTP development
    },
  },
  crossOriginOpenerPolicy: false, // Disable COOP for local development
  hsts: false, // Disable HTTP Strict Transport Security for local development
}));

// CORS configuration
app.use(cors({
  origin: config.cors.origins,
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    message: 'Too many requests, please try again later',
    timestamp: Date.now(),
  },
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '50mb' })); // Increased limit for base64 images
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Compression
app.use(compression());

// Logging
if (config.server.env === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Routes
app.use('/', routes);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Database connection and server startup
const startServer = async () => {
  try {
    // Test database connection
    await db.sequelize.authenticate();
    console.log('✓ Database connection established successfully');
    
    // Sync models (use { force: false } in production)
    // alter: false to prevent excessive syncing on every restart
    await db.sequelize.sync({ alter: false });
    console.log('✓ Database models synchronized');
    
    // Start server
    const PORT = config.server.port;
    app.listen(PORT, () => {
      console.log('');
      console.log('═══════════════════════════════════════════════════════');
      console.log('  Medical Device OCR Backend Server');
      console.log('═══════════════════════════════════════════════════════');
      console.log(`  Environment: ${config.server.env}`);
      console.log(`  Server running on: http://localhost:${PORT}`);
      console.log(`  Health check: http://localhost:${PORT}/api/health`);
      console.log('═══════════════════════════════════════════════════════');
      console.log('');
      console.log('Available endpoints:');
      console.log('  POST   /api/auth/login');
      console.log('  GET    /api/auth/profile');
      console.log('  POST   /api/auth/verify');
      console.log('  POST   /api/upload');
      console.log('  GET    /api/uploads');
      console.log('  GET    /api/upload/:id');
      console.log('  DELETE /api/upload/:id');
      console.log('  GET    /api/download/pdf/:id');
      console.log('  GET    /api/download/image/:id/:testName');
      console.log('  GET    /api/stats');
      console.log('');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await db.sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\nSIGINT received, shutting down gracefully');
  await db.sequelize.close();
  process.exit(0);
});

// Start the server
startServer();

module.exports = app;
