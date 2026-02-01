const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

/**
 * User Model
 * Stores user information for authentication
 */
const User = sequelize.define('User', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Health Worker',
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // Location/Organization fields for uploads
  phcName: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Primary Health Center name',
  },
  hubName: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Hub/Zone name',
  },
  blockName: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Block name',
  },
  districtName: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'District name',
  },
  // Legacy field - kept for backward compatibility
  healthCenter: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  district: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  state: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Tamil Nadu',
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'users',
  timestamps: true,
  indexes: [
    { fields: ['username'] },
    { fields: ['email'] },
    { fields: ['role'] },
  ],
});

/**
 * Hash password before creating user
 */
User.beforeCreate(async (user) => {
  if (user.password) {
    user.password = await bcrypt.hash(user.password, 10);
  }
});

/**
 * Hash password before updating user
 */
User.beforeUpdate(async (user) => {
  if (user.changed('password')) {
    user.password = await bcrypt.hash(user.password, 10);
  }
});

/**
 * Verify password
 * @param {string} plainPassword - The plain text password to verify
 * @returns {Promise<boolean>} - True if password matches
 */
User.prototype.verifyPassword = async function(plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

/**
 * Get user data without password (for API responses)
 * @returns {Object} - User object without password
 */
User.prototype.toSafeObject = function() {
  return {
    id: this.id,
    username: this.username,
    name: this.name,
    role: this.role,
    email: this.email,
    phoneNumber: this.phoneNumber,
    phcName: this.phcName,
    hubName: this.hubName,
    blockName: this.blockName,
    districtName: this.districtName,
    // Legacy fields for backward compatibility
    healthCenter: this.healthCenter,
    district: this.district,
    state: this.state,
  };
};

module.exports = User;
