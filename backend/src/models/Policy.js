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
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  organizationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Organizations',
      key: 'id'
    }
  },
  repositoryId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Repositories',
      key: 'id'
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['organizationId']
    },
    {
      fields: ['repositoryId']
    },
    {
      unique: true,
      fields: ['name', 'organizationId', 'repositoryId']
    }
  ],
  getterMethods: {
    rules() {
      // 如果rules关联已加载，返回规则列表
      if (this.policyRules) {
        return this.policyRules.map(rule => rule.toJSON());
      }
      return [];
    }
  }
});

export default Policy; 