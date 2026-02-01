const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * Authentication Routes
 * Base path: /api/auth
 */

// Login - POST /api/auth/login
router.post('/login', authController.login);

// Get profile (requires authentication) - GET /api/auth/profile
router.get('/profile', authMiddleware, authController.getProfile);

// Verify token - POST /api/auth/verify
router.post('/verify', authController.verifyToken);

module.exports = router;
