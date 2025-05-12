const { hasPermission, assignRoleToUser, removeRoleFromUser } = require('../../src/services/accessControlService');
const { User, Role, Permission } = require('../../src/models');
const { redisClient } = require('../../src/config/redis');

// Mock dependencies
jest.mock('../../src/models', () => ({
  User: {
    findByPk: jest.fn()
  },
  Role: {
    findByPk: jest.fn()
  },
  Permission: {}
}));

jest.mock('../../src/config/redis', () => ({
  redisClient: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    keys: jest.fn()
  }
}));

jest.mock('../../src/utils/logger');

describe('Access Control Service', () => {
  let mockUser;
  let mockRole;
  let mockPermission;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup test data
    mockPermission = { id: 1, name: 'view:users' };
    
    mockRole = {
      id: 1,
      name: 'Admin',
      Permissions: [mockPermission],
      addPermission: jest.fn(),
      removePermission: jest.fn()
    };
    
    mockUser = {
      id: 1,
      username: 'testuser',
      Roles: [mockRole],
      addRole: jest.fn(),
      removeRole: jest.fn()
    };
    
    // Setup mock implementations
    User.findByPk.mockResolvedValue(mockUser);
    Role.findByPk.mockResolvedValue(mockRole);
    redisClient.get.mockResolvedValue(null);
    redisClient.set.mockResolvedValue('OK');
    redisClient.keys.mockResolvedValue(['permission:1:view:users:global']);
    redisClient.del.mockResolvedValue(1);
  });

  describe('hasPermission', () => {
    it('should return true when user has the required permission', async () => {
      const result = await hasPermission(1, 'view:users');
      
      expect(User.findByPk).toHaveBeenCalledWith(1, {
        include: [
          {
            model: Role,
            include: [Permission]
          }
        ]
      });
      
      expect(redisClient.set).toHaveBeenCalledWith(
        'permission:1:view:users:global', 
        'true', 
        expect.any(Object)
      );
      
      expect(result).toBe(true);
    });
    
    it('should return false when user does not have the required permission', async () => {
      // Override mock to return user without the permission
      mockUser.Roles[0].Permissions = [{ id: 2, name: 'create:users' }];
      
      const result = await hasPermission(1, 'view:users');
      
      expect(redisClient.set).toHaveBeenCalledWith(
        'permission:1:view:users:global', 
        'false', 
        expect.any(Object)
      );
      
      expect(result).toBe(false);
    });
    
    it('should use cached result when available', async () => {
      // Mock redis to return a cached value
      redisClient.get.mockResolvedValue('true');
      
      const result = await hasPermission(1, 'view:users');
      
      expect(User.findByPk).not.toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe('assignRoleToUser', () => {
    it('should assign role to user and invalidate cache', async () => {
      const result = await assignRoleToUser(1, 1);
      
      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(Role.findByPk).toHaveBeenCalledWith(1);
      expect(mockUser.addRole).toHaveBeenCalledWith(mockRole);
      expect(redisClient.keys).toHaveBeenCalledWith('permission:1:*');
      expect(redisClient.del).toHaveBeenCalled();
      expect(result).toBe(true);
    });
    
    it('should return false if user or role not found', async () => {
      // Mock user not found
      User.findByPk.mockResolvedValue(null);
      
      const result = await assignRoleToUser(1, 1);
      
      expect(result).toBe(false);
    });
  });

  describe('removeRoleFromUser', () => {
    it('should remove role from user and invalidate cache', async () => {
      const result = await removeRoleFromUser(1, 1);
      
      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(Role.findByPk).toHaveBeenCalledWith(1);
      expect(mockUser.removeRole).toHaveBeenCalledWith(mockRole);
      expect(redisClient.keys).toHaveBeenCalledWith('permission:1:*');
      expect(redisClient.del).toHaveBeenCalled();
      expect(result).toBe(true);
    });
    
    it('should return false if user or role not found', async () => {
      // Mock role not found
      Role.findByPk.mockResolvedValue(null);
      
      const result = await removeRoleFromUser(1, 1);
      
      expect(result).toBe(false);
    });
  });
}); 