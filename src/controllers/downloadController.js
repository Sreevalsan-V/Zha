const path = require('path');
const fs = require('fs').promises;
const { Upload, TestRecord } = require('../models');
const ApiResponse = require('../utils/ApiResponse');
const { asyncHandler } = require('../middleware/errorHandler');
const config = require('../config/config');

/**
 * GET /api/download/pdf/:id
 * Download PDF file for specific upload
 */
const downloadPdf = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Find upload
  const upload = await Upload.findByPk(id);
  
  if (!upload) {
    return res.status(404).json(
      ApiResponse.error('Upload not found', 404)
    );
  }
  
  // Construct file path
  const filePath = path.join(
    config.upload.directory,
    upload.deviceId,
    upload.monthName,
    upload.id,
    'combined_report.pdf'
  );
  
  try {
    // Check if file exists
    await fs.access(filePath);
    
    // Set headers for download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${upload.pdfFileName}"`
    );
    
    // Stream file
    res.sendFile(path.resolve(filePath));
  } catch (error) {
    return res.status(404).json(
      ApiResponse.error('PDF file not found', 404)
    );
  }
});

/**
 * GET /api/download/image/:id/:testName
 * Download test image by test name (test-1, test-2, test-3)
 */
const downloadImage = asyncHandler(async (req, res) => {
  const { id, testName } = req.params;
  
  // Find upload and test record
  const upload = await Upload.findByPk(id);
  
  if (!upload) {
    return res.status(404).json(
      ApiResponse.error('Upload not found', 404)
    );
  }
  
  const testRecord = await TestRecord.findOne({
    where: {
      uploadId: id,
      testName,
    },
  });
  
  if (!testRecord) {
    return res.status(404).json(
      ApiResponse.error('Test record not found', 404)
    );
  }
  
  // Construct file path - find the actual file
  const dirPath = path.join(
    config.upload.directory,
    upload.deviceId,
    upload.monthName,
    upload.id
  );
  
  try {
    // Read directory to find matching file
    const files = await fs.readdir(dirPath);
    const imageFile = files.find(file => file.startsWith(testName));
    
    if (!imageFile) {
      return res.status(404).json(
        ApiResponse.error('Image file not found', 404)
      );
    }
    
    const filePath = path.join(dirPath, imageFile);
    
    // Determine content type
    const ext = path.extname(imageFile).toLowerCase();
    const contentType = ext === '.png' ? 'image/png' : 'image/jpeg';
    
    // Set headers
    res.setHeader('Content-Type', contentType);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${testRecord.imageFileName}"`
    );
    
    // Stream file
    res.sendFile(path.resolve(filePath));
  } catch (error) {
    return res.status(404).json(
      ApiResponse.error('Image file not found', 404)
    );
  }
});

module.exports = {
  downloadPdf,
  downloadImage,
};
