const jwt = require('jsonwebtoken');
const config = require('../config/config');

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user info to request
 */
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Authentication required. Please provide a valid token.',
        timestamp: Date.now(),
      });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(
        token,
        config.jwt.secret
      );

      // Attach user info to request
      req.user = {
        userId: decoded.userId,
        username: decoded.username,
        role: decoded.role,
      };

      next();
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          data: null,
          message: 'Token has expired. Please login again.',
          timestamp: Date.now(),
        });
      }

      return res.status(401).json({
        success: false,
        data: null,
        message: 'Invalid token. Please login again.',
        timestamp: Date.now(),
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Authentication error',
      timestamp: Date.now(),
    });
  }
};

module.exports = authMiddleware;
