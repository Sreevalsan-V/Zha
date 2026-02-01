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

// List all users (development only) - GET /api/users/list
router.get('/users/list', async (req, res) => {
  try {
    const User = require('../models/User');
    const users = await User.findAll({
      order: [['role', 'ASC'], ['username', 'ASC']]
    });

    // Map of known passwords (development only!)
    const knownPasswords = {
      'healthworker1': 'password123',
      'labtech1': 'labtech123',
      'admin1': 'admin123'
    };

    const usersData = users.map(user => ({
      id: user.id,
      username: user.username,
      plainPassword: knownPasswords[user.username] || 'See seed file',
      name: user.name,
      role: user.role,
      email: user.email,
      phoneNumber: user.phoneNumber,
      phcName: user.phcName,
      hubName: user.hubName,
      blockName: user.blockName,
      districtName: user.districtName,
      healthCenter: user.healthCenter,
      district: user.district,
      state: user.state,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));

    res.json({
      success: true,
      data: usersData,
      message: 'Users retrieved successfully',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Failed to fetch users',
      timestamp: Date.now()
    });
  }
});

module.exports = router;
