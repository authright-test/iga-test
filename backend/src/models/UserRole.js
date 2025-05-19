import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const UserRole = sequelize.define('UserRole', {
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
  roleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Roles',
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
  assignedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  assignedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
}, {
  tableName: 'UserRoles',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'roleId', 'organizationId'],
      name: 'user_roles_user_role_org_unique'
    },
    {
      fields: ['userId']
    },
    {
      fields: ['roleId']
    },
    {
      fields: ['organizationId']
    },
    {
      fields: ['assignedBy']
    }
  ]
});

export default UserRole; 