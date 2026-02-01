const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Upload = require('./Upload');

const TestRecord = sequelize.define('TestRecord', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false,
  },
  uploadId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Upload,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  testName: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Test identifier (test-1, test-2, test-3)',
  },
  testNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Sequential number for this test type',
  },
  testType: {
    type: DataTypes.ENUM('GLUCOSE', 'CREATININE', 'CHOLESTEROL'),
    allowNull: false,
    index: true,
  },
  testDisplayName: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Human-readable test name',
  },
  resultValue: {
    type: DataTypes.DOUBLE,
    allowNull: true,
    comment: 'Test result value',
  },
  unit: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'mg/dL',
  },
  rawOcrText: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Raw OCR output',
  },
  confidence: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'OCR confidence score (0-1)',
    validate: {
      min: 0,
      max: 1,
    },
  },
  validationTimestamp: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: 'Milliseconds since epoch when test was validated',
  },
  validationDateTime: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Human-readable datetime of test validation',
  },
  imageFileName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'URL path to the test image',
  },
  isValidResult: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  latitude: {
    type: DataTypes.DOUBLE,
    allowNull: true,
    comment: 'GPS latitude where test was taken',
    validate: {
      min: -90,
      max: 90,
    },
  },
  longitude: {
    type: DataTypes.DOUBLE,
    allowNull: true,
    comment: 'GPS longitude where test was taken',
    validate: {
      min: -180,
      max: 180,
    },
  },
}, {
  tableName: 'test_records',
  timestamps: true,
  indexes: [
    {
      fields: ['uploadId'],
    },
    {
      fields: ['testType'],
    },
    {
      fields: ['validationTimestamp'],
    },
  ],
});

// Define associations
Upload.hasMany(TestRecord, {
  foreignKey: 'uploadId',
  as: 'testRecords',
  onDelete: 'CASCADE',
});

TestRecord.belongsTo(Upload, {
  foreignKey: 'uploadId',
  as: 'upload',
});

module.exports = TestRecord;
