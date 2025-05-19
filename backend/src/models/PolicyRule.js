import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const PolicyRule = sequelize.define('PolicyRule', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  policyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Policies',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  condition: {
    type: DataTypes.JSON,
    allowNull: false
  },
  action: {
    type: DataTypes.JSON,
    allowNull: false
  },
  priority: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'PolicyRules',
  timestamps: true,
  indexes: [
    {
      fields: ['policyId']
    },
    {
      fields: ['type']
    },
    {
      fields: ['priority']
    }
  ]
});

export default PolicyRule; 