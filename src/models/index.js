const sequelize = require('../config/database');
const Upload = require('./Upload');
const TestRecord = require('./TestRecord');
const User = require('./User');

const db = {
  sequelize,
  Upload,
  TestRecord,
  User,
};

module.exports = db;
