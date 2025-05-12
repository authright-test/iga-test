const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Permission = sequelize.define('Permission', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  resource: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'The resource type this permission applies to, e.g. repository, organization'
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'The action allowed by this permission, e.g. read, write, admin'
  }
}, {
  timestamps: true
});

module.exports = Permission; 