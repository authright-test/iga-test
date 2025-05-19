import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Organization = sequelize.define('Organization', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  githubId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  login: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  avatarUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  website: {
    type: DataTypes.STRING,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  installationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  },
  plan: {
    type: DataTypes.ENUM('free', 'pro', 'enterprise'),
    defaultValue: 'free'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'suspended'),
    defaultValue: 'active'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  defaultRepositoryPermission: {
    type: DataTypes.ENUM('read', 'write', 'admin', 'none'),
    defaultValue: 'read'
  },
  membersCanCreateRepositories: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  twoFactorRequirementEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  samlEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['githubId']
    },
    {
      unique: true,
      fields: ['login']
    },
    {
      unique: true,
      fields: ['installationId']
    }
  ]
});

export default Organization; 