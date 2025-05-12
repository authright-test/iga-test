const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'The action that was performed'
  },
  resourceType: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'The type of resource that was affected'
  },
  resourceId: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'The ID of the resource that was affected'
  },
  details: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Additional details about the action'
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true
  },
  userAgent: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: true
});

module.exports = AuditLog; 