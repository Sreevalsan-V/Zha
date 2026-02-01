const ApiResponse = require('../utils/ApiResponse');
const multer = require('multer');

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Multer errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json(
        ApiResponse.error('File size too large. Maximum 10MB per file', 400)
      );
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json(
        ApiResponse.error('Too many files uploaded', 400)
      );
    }
    return res.status(400).json(
      ApiResponse.error(`Upload error: ${err.message}`, 400)
    );
  }

  // Validation errors
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map(e => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json(
      ApiResponse.validationError(errors)
    );
  }

  // Database errors
  if (err.name === 'SequelizeDatabaseError') {
    return res.status(500).json(
      ApiResponse.error('Database error occurred', 500)
    );
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json(
      ApiResponse.error('Invalid token', 401)
    );
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json(
      ApiResponse.error('Token expired', 401)
    );
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json(
    ApiResponse.error(message, statusCode)
  );
};

/**
 * 404 handler
 */
const notFoundHandler = (req, res) => {
  res.status(404).json(
    ApiResponse.error('Route not found', 404)
  );
};

/**
 * Async handler wrapper to catch errors in async route handlers
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
};
