'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('audit_logs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      organizationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'organizations',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      action: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      resourceType: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      resourceId: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      details: {
        type: Sequelize.JSON,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // 添加索引以提高查询性能
    await queryInterface.addIndex('audit_logs', ['organizationId'], {
      name: 'audit_organization_idx'
    });
    await queryInterface.addIndex('audit_logs', ['userId'], {
      name: 'audit_user_idx'
    });
    await queryInterface.addIndex('audit_logs', ['resourceType'], {
      name: 'audit_resource_type_idx'
    });
    await queryInterface.addIndex('audit_logs', ['action'], {
      name: 'audit_action_idx'
    });
    await queryInterface.addIndex('audit_logs', ['createdAt'], {
      name: 'audit_created_at_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('audit_logs');
  }
}; 