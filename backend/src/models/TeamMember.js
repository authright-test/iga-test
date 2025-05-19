import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const TeamMember = sequelize.define('TeamMember', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  teamId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Teams',
      key: 'id'
    }
  },
  role: {
    type: DataTypes.ENUM('maintainer', 'member'),
    defaultValue: 'member'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  },
  joinedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'TeamMembers',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'teamId'],
      name: 'team_members_user_team_unique'
    },
    {
      fields: ['userId']
    },
    {
      fields: ['teamId']
    },
    {
      fields: ['role']
    },
    {
      fields: ['status']
    }
  ]
});

export default TeamMember; 