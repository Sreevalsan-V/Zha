const { body, param, query, validationResult } = require('express-validator');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Middleware to validate request and return errors if any
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(ApiResponse.validationError(errors.array()));
  }
  next();
};

/**
 * Validation rules for upload endpoint
 */
const validateUpload = [
  body('upload')
    .exists().withMessage('Upload data is required')
    .isObject().withMessage('Upload must be an object')
    .custom((value) => {
      const requiredFields = ['id', 'timestamp', 'panelId', 'userId', 'userName', 'phcName', 'hubName', 'blockName', 'districtName', 'monthName'];
      const missingFields = requiredFields.filter(field => !value[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }
      
      // Validate panelId format
      if (typeof value.panelId !== 'string' || !value.panelId.match(/^DPHS-\d+$/)) {
        throw new Error('panelId must match pattern DPHS-{number} (e.g., "DPHS-1")');
      }
      
      // Validate user detail fields are non-empty
      const userFields = ['userId', 'userName', 'phcName', 'hubName', 'blockName', 'districtName'];
      for (const field of userFields) {
        if (typeof value[field] !== 'string' || !value[field].trim()) {
          throw new Error(`${field} must be a non-empty string`);
        }
      }
      
      return true;
    }),
  
  body('tests')
    .exists().withMessage('Tests array is required')
    .isArray({ min: 1, max: 3 }).withMessage('Tests must be an array with 1-3 items')
    .custom((tests) => {
      const validTypes = ['GLUCOSE', 'CREATININE', 'CHOLESTEROL'];
      const seenTypes = new Set();
      
      for (const test of tests) {
        if (!test.id || !test.type || !test.timestamp) {
          throw new Error('Each test must have: id, type, timestamp');
        }
        
        if (!validTypes.includes(test.type)) {
          throw new Error(`Invalid test type: ${test.type}. Valid types: ${validTypes.join(', ')}`);
        }
        
        if (seenTypes.has(test.type)) {
          throw new Error(`Duplicate test type: ${test.type}`);
        }
        seenTypes.add(test.type);
      }
      
      return true;
    }),
  
  body('pdfBase64')
    .exists().withMessage('PDF data is required')
    .isString().withMessage('PDF must be a base64 string')
    .notEmpty().withMessage('PDF data cannot be empty'),
  
  validate,
];

/**
 * Validation rules for listing uploads
 */
const validateGetUploads = [
  query('userId').optional().isString().withMessage('User ID must be a string'),
  query('startDate').optional().isInt().withMessage('Start date must be a timestamp'),
  query('endDate').optional().isInt().withMessage('End date must be a timestamp'),
  query('month').optional().isString().withMessage('Month must be a string'),
  validate,
];

/**
 * Validation rules for upload ID parameter
 */
const validateUploadId = [
  param('id').isUUID().withMessage('Invalid upload ID format'),
  validate,
];

/**
 * Validation rules for stats query
 */
const validateStats = [
  query('userId').optional().isString().withMessage('User ID must be a string'),
  validate,
];

module.exports = {
  validate,
  validateUpload,
  validateGetUploads,
  validateUploadId,
  validateStats,
};
