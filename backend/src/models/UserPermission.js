import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const UserPermission = sequelize.define('UserPermission', {
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
  permissionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Permissions',
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
  grantedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  grantedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
}, {
  tableName: 'UserPermissions',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'permissionId', 'organizationId'],
      name: 'user_permissions_user_perm_org_unique'
    },
    {
      fields: ['userId']
    },
    {
      fields: ['permissionId']
    },
    {
      fields: ['organizationId']
    },
    {
      fields: ['grantedBy']
    }
  ]
});

export default UserPermission; 