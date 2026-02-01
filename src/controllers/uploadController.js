const path = require('path');
const fs = require('fs').promises;
const { Upload, TestRecord } = require('../models');
const ApiResponse = require('../utils/ApiResponse');
const { asyncHandler } = require('../middleware/errorHandler');
const { Op } = require('sequelize');
const config = require('../config/config');

/**
 * Create Upload
 * POST /api/upload
 * 
 * Accepts JSON with base64-encoded images and PDF from Android app.
 * Stores files on disk and records in SQLite database.
 */
const createUpload = asyncHandler(async (req, res) => {
  const { upload, tests, pdfBase64 } = req.body;
  
  // Validate required fields
  if (!upload || !tests || !pdfBase64) {
    return res.status(400).json(
      ApiResponse.error('Missing required fields: upload, tests, or pdfBase64', 400)
    );
  }
  
  if (!Array.isArray(tests) || tests.length === 0 || tests.length > 3) {
    return res.status(400).json(
      ApiResponse.error('Tests must be an array with 1-3 items', 400)
    );
  }
  
  // Validate panelId format
  if (!upload.panelId || !upload.panelId.match(/^DPHS-\d+$/)) {
    return res.status(400).json(
      ApiResponse.error('panelId is required and must match pattern DPHS-{number} (e.g., "DPHS-1")', 400)
    );
  }
  
  // Validate user details are present and non-empty
  const requiredUserFields = ['userId', 'userName', 'phcName', 'hubName', 'blockName', 'districtName'];
  for (const field of requiredUserFields) {
    if (!upload[field] || !upload[field].trim()) {
      return res.status(400).json(
        ApiResponse.error(`Missing or empty required field: ${field}`, 400)
      );
    }
  }
  
  // Validate test types are unique
  const testTypes = tests.map(t => t.type);
  const uniqueTypes = new Set(testTypes);
  if (testTypes.length !== uniqueTypes.size) {
    return res.status(400).json(
      ApiResponse.error('Each test type can only appear once', 400)
    );
  }
  
  // Validate test types
  const validTypes = ['GLUCOSE', 'CREATININE', 'CHOLESTEROL'];
  for (const test of tests) {
    if (!validTypes.includes(test.type)) {
      return res.status(400).json(
        ApiResponse.error(`Invalid test type: ${test.type}. Must be GLUCOSE, CREATININE, or CHOLESTEROL`, 400)
      );
    }
  }
  
  try {
    // Create upload directory: uploads/{panelId}/{monthName}/{uploadId}/
    const uploadPath = path.join(
      config.upload.directory,
      upload.panelId,
      upload.monthName,
      upload.id
    );
    await fs.mkdir(uploadPath, { recursive: true });
    
    // Save PDF
    const pdfBuffer = Buffer.from(pdfBase64, 'base64');
    const pdfFilePath = path.join(uploadPath, 'combined_report.pdf');
    await fs.writeFile(pdfFilePath, pdfBuffer);
    
    // Format upload datetime
    const uploadDateTime = new Date(upload.timestamp).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    // Create upload record
    const pdfUrl = `/api/download/pdf/${upload.id}`;
    const uploadRecord = await Upload.create({
      id: upload.id,
      uploadTimestamp: upload.timestamp,
      uploadDateTime: uploadDateTime,
      monthName: upload.monthName,
      panelId: upload.panelId,
      userId: upload.userId,
      userName: upload.userName,
      phcName: upload.phcName,
      hubName: upload.hubName,
      blockName: upload.blockName,
      districtName: upload.districtName,
      latitude: upload.latitude,
      longitude: upload.longitude,
      pdfFileName: `combined_report_${upload.timestamp}.pdf`,
      pdfUrl,
    });
    
    // Save test images and create records
    const testRecords = [];
    let testCounter = 1;
    
    for (const test of tests) {
      // Save image
      const imageBuffer = Buffer.from(test.imageBase64, 'base64');
      const imageExtension = test.imageType === 'png' ? 'png' : 'jpg';
      const imageName = `test-${testCounter}.${imageExtension}`;
      const imagePath = path.join(uploadPath, imageName);
      await fs.writeFile(imagePath, imageBuffer);
      
      // Format test datetime
      const testDateTime = new Date(test.timestamp).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      
      // Get test display name
      const displayNames = {
        'GLUCOSE': 'Glucose',
        'CREATININE': 'Creatinine',
        'CHOLESTEROL': 'Cholesterol'
      };
      
      // Create test record
      const imageUrl = `/api/download/image/${upload.id}/test-${testCounter}`;
      const testRecord = await TestRecord.create({
        id: test.id,
        uploadId: upload.id,
        testName: `test-${testCounter}`,
        testNumber: testCounter,
        testType: test.type,
        testDisplayName: displayNames[test.type],
        resultValue: test.value,
        unit: test.unit || 'mg/dL',
        rawOcrText: test.rawText || '',
        confidence: test.confidence || null,
        validationTimestamp: test.timestamp,
        validationDateTime: testDateTime,
        imageFileName: `${test.type.toLowerCase()}_${test.timestamp}.${imageExtension}`,
        imageUrl,
        isValidResult: true,
        latitude: test.latitude,
        longitude: test.longitude,
      });
      
      testRecords.push(testRecord);
      testCounter++;
    }
    
    // Log upload
    console.log(`✓ Upload created: ${upload.id} | Panel: ${upload.panelId} | User: ${upload.userId} | Tests: ${testRecords.length}`);
    
    // Prepare response
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const responseData = {
      uploadId: uploadRecord.id,
      panelId: uploadRecord.panelId,
      userId: uploadRecord.userId,
      userName: uploadRecord.userName,
      phcName: uploadRecord.phcName,
      hubName: uploadRecord.hubName,
      blockName: uploadRecord.blockName,
      districtName: uploadRecord.districtName,
      uploadTime: uploadRecord.uploadDateTime,
      uploadLocation: {
        latitude: uploadRecord.latitude,
        longitude: uploadRecord.longitude,
      },
      pdfUrl: `${baseUrl}${pdfUrl}`,
      testsCount: testRecords.length,
      tests: testRecords.map(record => ({
        id: record.id,
        type: record.testType,
        displayName: record.testDisplayName,
        value: record.resultValue,
        unit: record.unit,
        testTime: record.validationDateTime,
        confidence: record.confidence,
        imageUrl: `${baseUrl}${record.imageUrl}`,
        testLocation: {
          latitude: record.latitude,
          longitude: record.longitude,
        },
      })),
    };
    
    res.status(201).json(
      ApiResponse.success(
        responseData,
        'Upload successful'
      )
    );
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json(
      ApiResponse.error(`Upload failed: ${error.message}`, 500)
    );
  }
});

/**
 * GET /api/uploads
 * Get all uploads with optional filters
 */
const getUploads = asyncHandler(async (req, res) => {
  const { userId, panelId, startDate, endDate, month } = req.query;
  
  // Build query conditions
  const where = {};
  
  if (userId) {
    where.userId = userId;
  }
  
  if (panelId) {
    where.panelId = panelId;
  }
  
  if (month) {
    where.monthName = month;
  }
  
  if (startDate || endDate) {
    where.uploadTimestamp = {};
    if (startDate) {
      where.uploadTimestamp[Op.gte] = parseInt(startDate);
    }
    if (endDate) {
      where.uploadTimestamp[Op.lte] = parseInt(endDate);
    }
  }
  
  // Fetch uploads with test records
  const uploads = await Upload.findAll({
    where,
    include: [
      {
        model: TestRecord,
        as: 'testRecords',
        attributes: {
          exclude: ['createdAt', 'updatedAt'],
        },
      },
    ],
    order: [['uploadTimestamp', 'DESC']],
  });
  
  // Format response
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const formattedUploads = uploads.map(upload => ({
    id: upload.id,
    panelId: upload.panelId,
    userId: upload.userId,
    userName: upload.userName,
    phcName: upload.phcName,
    hubName: upload.hubName,
    blockName: upload.blockName,
    districtName: upload.districtName,
    uploadTime: upload.uploadDateTime,
    uploadTimestamp: upload.uploadTimestamp,
    month: upload.monthName,
    uploadLocation: {
      latitude: upload.latitude,
      longitude: upload.longitude,
    },
    pdfUrl: `${baseUrl}${upload.pdfUrl}`,
    testsCount: upload.testRecords.length,
    tests: upload.testRecords.map(record => ({
      id: record.id,
      type: record.testType,
      displayName: record.testDisplayName,
      value: record.resultValue,
      unit: record.unit,
      testTime: record.validationDateTime,
      testTimestamp: record.validationTimestamp,
      confidence: record.confidence,
      imageUrl: `${baseUrl}${record.imageUrl}`,
      testLocation: {
        latitude: record.latitude,
        longitude: record.longitude,
      },
    })),
  }));
  
  res.json(
    ApiResponse.success(
      {
        uploads: formattedUploads,
        count: formattedUploads.length,
      },
      'Uploads retrieved successfully'
    )
  );
});

/**
 * GET /api/upload/:id
 * Get specific upload by ID
 */
const getUploadById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const upload = await Upload.findByPk(id, {
    include: [
      {
        model: TestRecord,
        as: 'testRecords',
        attributes: {
          exclude: ['createdAt', 'updatedAt'],
        },
      },
    ],
  });
  
  if (!upload) {
    return res.status(404).json(
      ApiResponse.error('Upload not found', 404)
    );
  }
  
  // Format response
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const formattedUpload = {
    id: upload.id,
    panelId: upload.panelId,
    userId: upload.userId,
    userName: upload.userName,
    phcName: upload.phcName,
    hubName: upload.hubName,
    blockName: upload.blockName,
    districtName: upload.districtName,
    uploadTime: upload.uploadDateTime,
    uploadTimestamp: upload.uploadTimestamp,
    month: upload.monthName,
    uploadLocation: {
      latitude: upload.latitude,
      longitude: upload.longitude,
    },
    pdfUrl: `${baseUrl}${upload.pdfUrl}`,
    tests: upload.testRecords.map(record => ({
      id: record.id,
      type: record.testType,
      displayName: record.testDisplayName,
      value: record.resultValue,
      unit: record.unit,
      rawText: record.rawOcrText,
      testTime: record.validationDateTime,
      testTimestamp: record.validationTimestamp,
      confidence: record.confidence,
      imageUrl: `${baseUrl}${record.imageUrl}`,
      testLocation: {
        latitude: record.latitude,
        longitude: record.longitude,
      },
    })),
  };
  
  res.json(
    ApiResponse.success(formattedUpload, 'Upload retrieved successfully')
  );
});

/**
 * DELETE /api/upload/:id
 * Delete an upload and its associated test records
 */
const deleteUpload = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const upload = await Upload.findByPk(id);
  
  if (!upload) {
    return res.status(404).json(
      ApiResponse.error('Upload not found', 404)
    );
  }
  
  // Delete upload (cascade will delete test records)
  await upload.destroy();
  res.json(
    ApiResponse.success(
      { deletedId: id },
      'Upload deleted successfully'
    )
  );
});

module.exports = {
  createUpload,
  getUploads,
  getUploadById,
  deleteUpload,
};
