const { Upload, TestRecord, sequelize } = require('../models');
const ApiResponse = require('../utils/ApiResponse');
const { asyncHandler } = require('../middleware/errorHandler');
const { Op } = require('sequelize');

/**
 * GET /api/stats
 * Get comprehensive statistics for uploads and tests
 */
const getStatistics = asyncHandler(async (req, res) => {
  const { deviceId } = req.query;
  
  // Build where clause
  const uploadWhere = deviceId ? { deviceId } : {};
  
  // Total uploads
  const totalUploads = await Upload.count({ where: uploadWhere });
  
  // Total test records
  const totalTests = await TestRecord.count({
    include: deviceId ? [{
      model: Upload,
      as: 'upload',
      where: { deviceId },
      attributes: [],
    }] : [],
  });
  
  // Uploads per month
  const uploadsPerMonth = await Upload.findAll({
    where: uploadWhere,
    attributes: [
      'monthName',
      [sequelize.fn('COUNT', sequelize.col('Upload.id')), 'count'],
    ],
    group: ['monthName'],
    order: [[sequelize.literal('count'), 'DESC']],
  });
  
  // Uploads per device
  const uploadsPerDevice = await Upload.findAll({
    attributes: [
      'deviceId',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
    ],
    group: ['deviceId'],
    order: [[sequelize.literal('count'), 'DESC']],
  });
  
  // Average test values by type
  const avgTestValues = await TestRecord.findAll({
    attributes: [
      'testType',
      [sequelize.fn('AVG', sequelize.col('resultValue')), 'avgValue'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      [sequelize.fn('MIN', sequelize.col('resultValue')), 'minValue'],
      [sequelize.fn('MAX', sequelize.col('resultValue')), 'maxValue'],
    ],
    where: {
      resultValue: { [Op.not]: null },
      isValidResult: true,
    },
    include: deviceId ? [{
      model: Upload,
      as: 'upload',
      where: { deviceId },
      attributes: [],
    }] : [],
    group: ['testType'],
  });
  
  // Test count by type
  const testsByType = await TestRecord.findAll({
    attributes: [
      'testType',
      [sequelize.fn('COUNT', sequelize.col('TestRecord.id')), 'count'],
    ],
    include: deviceId ? [{
      model: Upload,
      as: 'upload',
      where: { deviceId },
      attributes: [],
    }] : [],
    group: ['testType'],
  });
  
  // Recent uploads timeline
  const recentUploads = await Upload.findAll({
    where: uploadWhere,
    include: [{
      model: TestRecord,
      as: 'testRecords',
      attributes: ['testType', 'resultValue'],
    }],
    order: [['uploadTimestamp', 'DESC']],
    limit: 10,
  });
  
  // Hourly distribution of tests (SQLite compatible)
  const hourlyDistribution = await TestRecord.findAll({
    attributes: [
      [sequelize.fn('strftime', '%H', sequelize.literal('datetime(validationTimestamp / 1000, "unixepoch")')), 'hour'],
      [sequelize.fn('COUNT', sequelize.col('TestRecord.id')), 'count'],
    ],
    include: deviceId ? [{
      model: Upload,
      as: 'upload',
      where: { deviceId },
      attributes: [],
    }] : [],
    group: [sequelize.fn('strftime', '%H', sequelize.literal('datetime(validationTimestamp / 1000, "unixepoch")'))],
    order: [[sequelize.literal('hour'), 'ASC']],
    raw: true,
  });
  
  // Confidence statistics
  const confidenceStats = await TestRecord.findAll({
    attributes: [
      [sequelize.fn('AVG', sequelize.col('confidence')), 'avgConfidence'],
      [sequelize.fn('MIN', sequelize.col('confidence')), 'minConfidence'],
      [sequelize.fn('MAX', sequelize.col('confidence')), 'maxConfidence'],
    ],
    where: {
      confidence: { [Op.not]: null },
    },
    include: deviceId ? [{
      model: Upload,
      as: 'upload',
      where: { deviceId },
      attributes: [],
    }] : [],
    raw: true,
  });
  
  // Format response
  const statistics = {
    overview: {
      totalUploads,
      totalTests,
      totalDevices: uploadsPerDevice.length,
      avgTestsPerUpload: totalUploads > 0 ? (totalTests / totalUploads).toFixed(2) : 0,
    },
    
    uploadsByMonth: uploadsPerMonth.map(item => ({
      month: item.monthName,
      count: parseInt(item.getDataValue('count')),
    })),
    
    uploadsByDevice: uploadsPerDevice.map(item => ({
      deviceId: item.deviceId,
      count: parseInt(item.getDataValue('count')),
    })),
    
    testStatistics: avgTestValues.map(item => ({
      testType: item.testType,
      count: parseInt(item.getDataValue('count')),
      average: parseFloat(parseFloat(item.getDataValue('avgValue')).toFixed(2)),
      min: parseFloat(parseFloat(item.getDataValue('minValue')).toFixed(2)),
      max: parseFloat(parseFloat(item.getDataValue('maxValue')).toFixed(2)),
    })),
    
    testsByType: testsByType.map(item => ({
      testType: item.testType,
      count: parseInt(item.getDataValue('count')),
    })),
    
    hourlyDistribution: hourlyDistribution.map(item => ({
      hour: parseInt(item.hour),
      count: parseInt(item.count),
    })),
    
    confidenceStats: confidenceStats[0] ? {
      average: parseFloat(parseFloat(confidenceStats[0].avgConfidence).toFixed(3)),
      min: parseFloat(parseFloat(confidenceStats[0].minConfidence).toFixed(3)),
      max: parseFloat(parseFloat(confidenceStats[0].maxConfidence).toFixed(3)),
    } : null,
    
    recentUploads: recentUploads.map(upload => ({
      id: upload.id,
      deviceId: upload.deviceId,
      uploadDateTime: upload.uploadDateTime,
      monthName: upload.monthName,
      testCount: upload.testRecords.length,
      location: {
        latitude: upload.latitude,
        longitude: upload.longitude,
      },
    })),
  };
  
  res.json(
    ApiResponse.success(statistics, 'Statistics retrieved successfully')
  );
});

module.exports = {
  getStatistics,
};
