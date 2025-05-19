import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const OrganizationMember = sequelize.define('OrganizationMember', {
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
  organizationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Organizations',
      key: 'id'
    }
  },
  role: {
    type: DataTypes.ENUM('admin', 'member', 'owner'),
    defaultValue: 'member'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'pending'),
    defaultValue: 'active'
  },
  joinedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  lastActiveAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'OrganizationMembers',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'organizationId'],
      name: 'organization_members_user_org_unique'
    },
    {
      fields: ['userId']
    },
    {
      fields: ['organizationId']
    },
    {
      fields: ['role']
    },
    {
      fields: ['status']
    }
  ]
});

export default OrganizationMember; 