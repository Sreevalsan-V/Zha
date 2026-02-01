const express = require('express');
const router = express.Router();

// Import route modules
const webRoutes = require('./webRoutes');
const uploadRoutes = require('./uploadRoutes');
const downloadRoutes = require('./downloadRoutes');
const statsRoutes = require('./statsRoutes');
const authRoutes = require('./authRoutes');

// Mount web UI routes (HTML pages)
router.use('/', webRoutes);

// Health check endpoint
router.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Medical Device OCR API is running',
    version: '1.0.0',
    timestamp: Date.now(),
  });
});

// Mount API routes
router.use('/api', uploadRoutes);
router.use('/api', downloadRoutes);
router.use('/api', statsRoutes);
router.use('/api/auth', authRoutes);

module.exports = router;
