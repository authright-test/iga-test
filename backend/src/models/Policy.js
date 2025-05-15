import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Policy = sequelize.define('Policy', {
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
  conditions: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'JSON conditions for policy evaluation'
  },
  actions: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'JSON actions to take when policy is violated'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  severity: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium'
  }
}, {
  timestamps: true
});

export default Policy; 