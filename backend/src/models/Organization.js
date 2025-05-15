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
  avatarUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  installationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true
});

export default Organization; 