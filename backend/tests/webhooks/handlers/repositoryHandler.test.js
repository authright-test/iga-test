const { handleRepositoryCreated, handleRepositoryVisibilityChanged } = require('../../../src/webhooks/handlers/repositoryHandler');
const { User, Organization, Repository, AuditLog } = require('../../../src/models');
const { evaluatePolicy, executePolicyActions, getOrganizationPolicies } = require('../../../src/services/policyService');

// Mock dependencies
jest.mock('../../../src/models', () => ({
  User: {
    findOne: jest.fn(),
    findOrCreate: jest.fn()
  },
  Organization: {
    findOne: jest.fn()
  },
  Repository: {
    findOne: jest.fn(),
    findOrCreate: jest.fn()
  },
  AuditLog: {
    create: jest.fn()
  }
}));

jest.mock('../../../src/services/policyService');
jest.mock('../../../src/utils/logger');

describe('Repository Webhook Handlers', () => {
  let mockPayload;
  let mockOrgRecord;
  let mockSenderRecord;
  let mockRepoRecord;
  let mockPolicies;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup test data
    mockPayload = {
      action: 'created',
      repository: {
        id: 12345,
        name: 'test-repo',
        full_name: 'test-org/test-repo',
        private: true,
        description: 'Test repository',
        html_url: 'https://github.com/test-org/test-repo'
      },
      sender: {
        id: 67890,
        login: 'testuser',
        avatar_url: 'https://github.com/testuser.png'
      },
      organization: {
        id: 54321,
        login: 'test-org'
      }
    };
    
    mockOrgRecord = {
      id: 1,
      githubId: '54321',
      name: 'Test Org',
      login: 'test-org',
      installationId: 98765
    };
    
    mockSenderRecord = {
      id: 1,
      githubId: '67890',
      username: 'testuser'
    };
    
    mockRepoRecord = {
      id: 1,
      githubId: '12345',
      name: 'test-repo',
      fullName: 'test-org/test-repo',
      private: true,
      update: jest.fn()
    };
    
    mockPolicies = [
      {
        id: 1,
        name: 'No Public Repos',
        isActive: true
      }
    ];
    
    // Setup mock implementations
    Organization.findOne.mockResolvedValue(mockOrgRecord);
    User.findOrCreate.mockResolvedValue([mockSenderRecord, false]);
    Repository.findOrCreate.mockResolvedValue([mockRepoRecord, true]);
    Repository.findOne.mockResolvedValue(mockRepoRecord);
    AuditLog.create.mockResolvedValue({});
    getOrganizationPolicies.mockResolvedValue(mockPolicies);
    evaluatePolicy.mockResolvedValue(false); // Default to no policy violations
  });

  describe('handleRepositoryCreated', () => {
    it('should create audit log for repository creation', async () => {
      await handleRepositoryCreated(mockPayload);
      
      // Check for organization lookup
      expect(Organization.findOne).toHaveBeenCalledWith({
        where: { githubId: mockPayload.organization.id.toString() }
      });
      
      // Check for sender lookup/creation
      expect(User.findOrCreate).toHaveBeenCalledWith({
        where: { githubId: mockPayload.sender.id.toString() },
        defaults: expect.any(Object)
      });
      
      // Check for repository creation
      expect(Repository.findOrCreate).toHaveBeenCalledWith({
        where: { githubId: mockPayload.repository.id.toString() },
        defaults: expect.any(Object)
      });
      
      // Check for audit log creation
      expect(AuditLog.create).toHaveBeenCalledWith({
        action: 'repository_created',
        resourceType: 'repository',
        resourceId: mockPayload.repository.id.toString(),
        details: expect.any(Object),
        UserId: mockSenderRecord.id
      });
      
      // Check policies evaluation
      expect(getOrganizationPolicies).toHaveBeenCalledWith(mockOrgRecord.id);
      expect(evaluatePolicy).toHaveBeenCalledWith(
        mockPolicies[0],
        mockPayload,
        expect.any(Object)
      );
    });
    
    it('should execute policy actions when policy is violated', async () => {
      // Setup policy violation
      evaluatePolicy.mockResolvedValue(true);
      
      await handleRepositoryCreated(mockPayload);
      
      // Check policy actions execution
      expect(executePolicyActions).toHaveBeenCalledWith(
        mockPolicies[0],
        mockPayload,
        expect.any(Object)
      );
    });
    
    it('should handle organization not found gracefully', async () => {
      // Mock organization not found
      Organization.findOne.mockResolvedValue(null);
      
      await handleRepositoryCreated(mockPayload);
      
      // Should exit early
      expect(Repository.findOrCreate).not.toHaveBeenCalled();
      expect(AuditLog.create).not.toHaveBeenCalled();
    });
  });

  describe('handleRepositoryVisibilityChanged', () => {
    beforeEach(() => {
      // Setup visibility change payload
      mockPayload.action = 'publicized';
      mockPayload.visibility = 'public';
    });
    
    it('should create audit log for visibility change', async () => {
      await handleRepositoryVisibilityChanged(mockPayload);
      
      // Check for repository lookup
      expect(Repository.findOne).toHaveBeenCalledWith({
        where: { githubId: mockPayload.repository.id.toString() }
      });
      
      // Check for audit log creation
      expect(AuditLog.create).toHaveBeenCalledWith({
        action: 'repository_visibility_changed',
        resourceType: 'repository',
        resourceId: mockPayload.repository.id.toString(),
        details: expect.any(Object),
        UserId: mockSenderRecord.id
      });
      
      // Check for repository update
      expect(mockRepoRecord.update).toHaveBeenCalledWith({
        private: false
      });
    });
    
    it('should execute policy actions when visibility policy is violated', async () => {
      // Setup policy violation
      evaluatePolicy.mockResolvedValue(true);
      
      await handleRepositoryVisibilityChanged(mockPayload);
      
      // Check policy actions execution
      expect(executePolicyActions).toHaveBeenCalledWith(
        mockPolicies[0],
        mockPayload,
        expect.any(Object)
      );
    });
  });
}); 