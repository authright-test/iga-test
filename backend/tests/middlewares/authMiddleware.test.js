const { authenticateJWT, authenticateGitHubApp, isOrganizationMember, isOrganizationAdmin } = require('../../src/middleware/auth');
const { User, Organization } = require('../../src/models');
const { githubApp } = require('../../src/services/authService');

// Mock dependencies
jest.mock('../../src/models');
jest.mock('../../src/services/authService');
jest.mock('../../src/utils/logger');

describe('Auth Middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup request, response and next function mocks
    req = {
      headers: {
        authorization: 'Bearer valid-token'
      },
      params: {
        organizationId: '1'
      }
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    next = jest.fn();
  });

  describe('authenticateJWT', () => {
    it('should call next() when token is valid', async () => {
      // Mock user
      const mockUser = {
        id: 1,
        username: 'testuser',
        Organizations: [{
          id: 1,
          name: 'Test Org',
          login: 'test-org',
          avatarUrl: 'https://example.com/avatar.png'
        }]
      };
      
      User.findByPk.mockResolvedValue(mockUser);
      
      // Call middleware
      await authenticateJWT(req, res, next);
      
      // Check user was added to request
      expect(req.user).toEqual(mockUser);
      
      // Check next was called
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 401 when token is missing', async () => {
      // Remove token
      req.headers = {};
      
      // Call middleware
      await authenticateJWT(req, res, next);
      
      // Check response
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'No token provided' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when user is not found', async () => {
      // Mock user not found
      User.findByPk.mockResolvedValue(null);
      
      // Call middleware
      await authenticateJWT(req, res, next);
      
      // Check response
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('authenticateGitHubApp', () => {
    it('should call next() when installation is valid', async () => {
      // Mock installation
      const mockInstallation = {
        id: 1,
        account: {
          login: 'test-org'
        }
      };
      
      githubApp.getInstallation.mockResolvedValue(mockInstallation);
      
      // Set installation ID
      req.headers['x-github-installation-id'] = '1';
      
      // Call middleware
      await authenticateGitHubApp(req, res, next);
      
      // Check installation was added to request
      expect(req.installation).toEqual(mockInstallation);
      
      // Check next was called
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 401 when installation ID is missing', async () => {
      // Call middleware
      await authenticateGitHubApp(req, res, next);
      
      // Check response
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'No GitHub installation ID provided' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when installation is invalid', async () => {
      // Mock invalid installation
      githubApp.getInstallation.mockResolvedValue(null);
      
      // Set installation ID
      req.headers['x-github-installation-id'] = '1';
      
      // Call middleware
      await authenticateGitHubApp(req, res, next);
      
      // Check response
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid GitHub installation' });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('isOrganizationMember', () => {
    it('should call next() when user is a member', async () => {
      // Mock user
      req.user = {
        hasOrganization: jest.fn().mockResolvedValue(true)
      };
      
      // Call middleware
      await isOrganizationMember(req, res, next);
      
      // Check next was called
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 401 when user is not authenticated', async () => {
      // Call middleware
      await isOrganizationMember(req, res, next);
      
      // Check response
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 when user is not a member', async () => {
      // Mock user
      req.user = {
        hasOrganization: jest.fn().mockResolvedValue(false)
      };
      
      // Call middleware
      await isOrganizationMember(req, res, next);
      
      // Check response
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Not a member of this organization' });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('isOrganizationAdmin', () => {
    it('should call next() when user is an admin', async () => {
      // Mock user
      req.user = {
        hasOrganization: jest.fn().mockResolvedValue(true)
      };
      
      // Call middleware
      await isOrganizationAdmin(req, res, next);
      
      // Check next was called
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 401 when user is not authenticated', async () => {
      // Call middleware
      await isOrganizationAdmin(req, res, next);
      
      // Check response
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 when user is not an admin', async () => {
      // Mock user
      req.user = {
        hasOrganization: jest.fn().mockResolvedValue(false)
      };
      
      // Call middleware
      await isOrganizationAdmin(req, res, next);
      
      // Check response
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Not an admin of this organization' });
      expect(next).not.toHaveBeenCalled();
    });
  });
}); 