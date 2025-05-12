const { evaluatePolicy, createPolicy, updatePolicy, deletePolicy } = require('../../src/services/policyService');
const { Policy, Organization, AuditLog } = require('../../src/models');
const { githubApp } = require('../../src/services/authService');

// Mock dependencies
jest.mock('../../src/models', () => ({
  Policy: {
    create: jest.fn(),
    findByPk: jest.fn()
  },
  Organization: {
    findByPk: jest.fn()
  },
  AuditLog: {
    create: jest.fn()
  }
}));

jest.mock('../../src/services/authService', () => ({
  githubApp: {
    getInstallationAccessToken: jest.fn()
  }
}));

jest.mock('@octokit/rest');
jest.mock('../../src/utils/logger');

describe('Policy Service', () => {
  let mockPolicy;
  let mockOrganization;
  let mockEvent;
  let mockContext;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup test data
    mockPolicy = {
      id: 1,
      name: 'No Public Repos',
      description: 'Prevents repositories from being made public',
      conditions: [
        { type: 'equals', field: 'action', value: 'publicized' }
      ],
      actions: [
        { type: 'revert_change' }
      ],
      severity: 'high',
      isActive: true,
      addOrganization: jest.fn(),
      update: jest.fn(),
      destroy: jest.fn()
    };
    
    mockOrganization = {
      id: 1,
      name: 'Test Org',
      login: 'test-org',
      installationId: 12345
    };
    
    mockEvent = {
      action: 'publicized',
      repository: {
        id: 9876,
        name: 'test-repo',
        owner: {
          login: 'test-org'
        }
      }
    };
    
    mockContext = {
      event: 'repository_visibility_changed',
      organization: mockOrganization,
      resourceType: 'repository',
      resourceId: '9876',
      userId: 1,
      installationId: 12345
    };
    
    // Setup mock implementations
    Policy.create.mockResolvedValue(mockPolicy);
    Policy.findByPk.mockResolvedValue(mockPolicy);
    Organization.findByPk.mockResolvedValue(mockOrganization);
    AuditLog.create.mockResolvedValue({});
    githubApp.getInstallationAccessToken.mockResolvedValue('mock-token');
  });

  describe('evaluatePolicy', () => {
    it('should return true when all conditions match', async () => {
      const result = await evaluatePolicy(mockPolicy, mockEvent, mockContext);
      expect(result).toBe(true);
    });
    
    it('should return false when conditions do not match', async () => {
      // Change event action to not match condition
      mockEvent.action = 'created';
      
      const result = await evaluatePolicy(mockPolicy, mockEvent, mockContext);
      expect(result).toBe(false);
    });
    
    it('should return false when field does not exist in event', async () => {
      // Change condition to check a non-existent field
      mockPolicy.conditions = [
        { type: 'equals', field: 'nonexistent.field', value: 'test' }
      ];
      
      const result = await evaluatePolicy(mockPolicy, mockEvent, mockContext);
      expect(result).toBe(false);
    });
  });

  describe('createPolicy', () => {
    it('should create a policy and associate it with organization', async () => {
      const policyData = {
        name: 'New Policy',
        description: 'Test policy',
        conditions: [{ type: 'equals', field: 'action', value: 'created' }],
        actions: [{ type: 'notify_admin' }],
        severity: 'medium'
      };
      
      const result = await createPolicy(policyData, 1, 1);
      
      expect(Policy.create).toHaveBeenCalledWith({
        name: policyData.name,
        description: policyData.description,
        conditions: policyData.conditions,
        actions: policyData.actions,
        severity: policyData.severity,
        isActive: true
      });
      
      expect(Organization.findByPk).toHaveBeenCalledWith(1);
      expect(mockPolicy.addOrganization).toHaveBeenCalledWith(mockOrganization);
      expect(AuditLog.create).toHaveBeenCalledWith({
        action: 'policy_created',
        resourceType: 'policy',
        resourceId: mockPolicy.id.toString(),
        details: expect.any(Object),
        UserId: 1
      });
      
      expect(result).toEqual(mockPolicy);
    });
  });

  describe('updatePolicy', () => {
    it('should update a policy', async () => {
      const policyData = {
        name: 'Updated Policy',
        severity: 'critical'
      };
      
      const result = await updatePolicy(1, policyData, 1);
      
      expect(Policy.findByPk).toHaveBeenCalledWith(1);
      expect(mockPolicy.update).toHaveBeenCalledWith({
        name: policyData.name,
        description: mockPolicy.description,
        conditions: mockPolicy.conditions,
        actions: mockPolicy.actions,
        severity: policyData.severity,
        isActive: mockPolicy.isActive
      });
      
      expect(AuditLog.create).toHaveBeenCalledWith({
        action: 'policy_updated',
        resourceType: 'policy',
        resourceId: mockPolicy.id.toString(),
        details: expect.any(Object),
        UserId: 1
      });
      
      expect(result).toEqual(mockPolicy);
    });
    
    it('should throw error when policy not found', async () => {
      // Mock policy not found
      Policy.findByPk.mockResolvedValue(null);
      
      await expect(updatePolicy(1, {}, 1)).rejects.toThrow('Policy not found');
    });
  });

  describe('deletePolicy', () => {
    it('should delete a policy', async () => {
      const result = await deletePolicy(1, 1);
      
      expect(Policy.findByPk).toHaveBeenCalledWith(1);
      expect(AuditLog.create).toHaveBeenCalledWith({
        action: 'policy_deleted',
        resourceType: 'policy',
        resourceId: mockPolicy.id.toString(),
        details: expect.any(Object),
        UserId: 1
      });
      expect(mockPolicy.destroy).toHaveBeenCalled();
      expect(result).toBe(true);
    });
    
    it('should throw error when policy not found', async () => {
      // Mock policy not found
      Policy.findByPk.mockResolvedValue(null);
      
      await expect(deletePolicy(1, 1)).rejects.toThrow('Policy not found');
    });
  });
}); 