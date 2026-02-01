const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Upload = sequelize.define('Upload', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false,
  },
  uploadTimestamp: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: 'Milliseconds since epoch when upload was created',
  },
  uploadDateTime: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Human-readable datetime format',
  },
  monthName: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Month and year (e.g., "January 2026")',
    index: true,
  },
  // Panel identification from QR code scan
  panelId: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Panel ID from QR scan (e.g., "DPHS-1")',
    index: true,
    validate: {
      is: /^DPHS-\d+$/,
    },
  },
  // User details (replacing simple deviceId)
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'User/Employee ID',
    index: true,
  },
  userName: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Full name of user (health worker/doctor)',
  },
  phcName: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Primary Health Center name',
    index: true,
  },
  hubName: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Hub/Zone name',
  },
  blockName: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Block name',
    index: true,
  },
  districtName: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'District name',
    index: true,
  },
  latitude: {
    type: DataTypes.DOUBLE,
    allowNull: true,
    comment: 'GPS latitude where upload was created',
    validate: {
      min: -90,
      max: 90,
    },
  },
  longitude: {
    type: DataTypes.DOUBLE,
    allowNull: true,
    comment: 'GPS longitude where upload was created',
    validate: {
      min: -180,
      max: 180,
    },
  },
  pdfFileName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  pdfUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'URL path to the PDF file',
  },
}, {
  tableName: 'uploads',
  timestamps: true,
  indexes: [
    {
      fields: ['panelId', 'uploadTimestamp'],
    },
    {
      fields: ['userId', 'uploadTimestamp'],
    },
    {
      fields: ['panelId', 'userId', 'uploadTimestamp'],
    },
    {
      fields: ['phcName'],
    },
    {
      fields: ['districtName'],
    },
    {
      fields: ['blockName'],
    },
    {
      fields: ['monthName'],
    },
    {
      fields: ['uploadTimestamp'],
    },
  ],
});

module.exports = Upload;
