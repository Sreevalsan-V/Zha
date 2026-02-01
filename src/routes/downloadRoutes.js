const express = require('express');
const router = express.Router();
const { validateUploadId } = require('../middleware/validators');
const { downloadPdf, downloadImage } = require('../controllers/downloadController');

// GET /api/download/pdf/:id - Download PDF file
router.get('/download/pdf/:id', validateUploadId, downloadPdf);

// GET /api/download/image/:id/:testName - Download test image
router.get('/download/image/:id/:testName', downloadImage);

module.exports = router;
