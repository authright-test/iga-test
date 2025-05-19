import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const TeamRepository = sequelize.define('TeamRepository', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  teamId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Teams',
      key: 'id'
    }
  },
  repositoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Repositories',
      key: 'id'
    }
  },
  permission: {
    type: DataTypes.ENUM('read', 'write', 'admin'),
    defaultValue: 'read'
  },
  addedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  addedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
}, {
  tableName: 'TeamRepositories',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['teamId', 'repositoryId'],
      name: 'team_repositories_team_repo_unique'
    },
    {
      fields: ['teamId']
    },
    {
      fields: ['repositoryId']
    },
    {
      fields: ['permission']
    },
    {
      fields: ['addedBy']
    }
  ]
});

export default TeamRepository; 