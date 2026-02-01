const User = require('../models/User');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

/**
 * Login user
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        data: null,
        message: !username ? 'Username is required' : 'Password is required',
        timestamp: Date.now(),
      });
    }

    // Find user by username (case-insensitive)
    const user = await User.findOne({
      where: {
        username: username.toLowerCase(),
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Invalid username or password',
        timestamp: Date.now(),
      });
    }

    // Verify password
    const isValidPassword = await user.verifyPassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Invalid username or password',
        timestamp: Date.now(),
      });
    }

    // Update last login
    await user.update({ lastLogin: new Date() });

    // Generate JWT token (optional but included)
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiry }
    );

    // Return success response
    res.status(200).json({
      success: true,
      data: {
        token,
        user: user.toSafeObject(),
      },
      message: 'Login successful',
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'An error occurred during login',
      timestamp: Date.now(),
    });
  }
};

/**
 * Get user profile
 * GET /api/auth/profile
 */
const getProfile = async (req, res) => {
  try {
    // Get user ID from JWT token (set by auth middleware)
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Authentication required',
        timestamp: Date.now(),
      });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'User not found',
        timestamp: Date.now(),
      });
    }

    res.status(200).json({
      success: true,
      data: user.toSafeObject(),
      message: 'Profile retrieved successfully',
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'An error occurred while retrieving profile',
      timestamp: Date.now(),
    });
  }
};

/**
 * Verify JWT token and get user
 * POST /api/auth/verify
 */
const verifyToken = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'No token provided',
        timestamp: Date.now(),
      });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(
        token,
        config.jwt.secret
      );

      const user = await User.findByPk(decoded.userId);

      if (!user) {
        return res.status(401).json({
          success: false,
          data: null,
          message: 'User not found',
          timestamp: Date.now(),
        });
      }

      res.status(200).json({
        success: true,
        data: user.toSafeObject(),
        message: 'Token is valid',
        timestamp: Date.now(),
      });
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Invalid or expired token',
        timestamp: Date.now(),
      });
    }
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'An error occurred during token verification',
      timestamp: Date.now(),
    });
  }
};

module.exports = {
  login,
  getProfile,
  verifyToken,
};
