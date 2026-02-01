const express = require('express');
const router = express.Router();

const { validateUpload, validateGetUploads, validateUploadId } = require('../middleware/validators');
const { createUpload, getUploads, getUploadById, deleteUpload } = require('../controllers/uploadController');

// POST /api/upload - Create new upload with JSON body
router.post('/upload', validateUpload, createUpload);

// GET /api/uploads - Get all uploads with filters
router.get('/uploads', validateGetUploads, getUploads);

// GET /api/upload/:id - Get specific upload by ID
router.get('/upload/:id', validateUploadId, getUploadById);

// DELETE /api/upload/:id - Delete upload by ID
router.delete('/upload/:id', validateUploadId, deleteUpload);

module.exports = router;
