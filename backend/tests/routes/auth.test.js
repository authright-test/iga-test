const request = require('supertest');
const express = require('express');
const authRoutes = require('../../src/routes/auth');
const { authenticateUser, verifyToken } = require('../../src/services/authService');

// Mock dependencies
jest.mock('../../src/services/authService');
jest.mock('../../src/utils/logger');

describe('Auth Routes', () => {
  let app;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup Express app
    app = express();
    app.use(express.json());
    app.use('/auth', authRoutes);
  });

  describe('POST /auth/login', () => {
    it('should login user and return token and user data', async () => {
      // Mock successful authentication
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        avatarUrl: 'https://example.com/avatar.png'
      };
      
      const mockOrganization = {
        id: 1,
        name: 'Test Org',
        login: 'test-org',
        avatarUrl: 'https://example.com/org.png'
      };
      
      const mockToken = 'test-token';
      
      authenticateUser.mockResolvedValue({
        user: mockUser,
        organization: mockOrganization,
        token: mockToken
      });
      
      // Make request
      const response = await request(app)
        .post('/auth/login')
        .send({ code: 'github-oauth-code' })
        .expect(200);
      
      // Verify authentication was called
      expect(authenticateUser).toHaveBeenCalledWith('github-oauth-code');
      
      // Verify response
      expect(response.body).toEqual({
        user: {
          id: mockUser.id,
          username: mockUser.username,
          email: mockUser.email,
          avatarUrl: mockUser.avatarUrl
        },
        organization: {
          id: mockOrganization.id,
          name: mockOrganization.name,
          login: mockOrganization.login,
          avatarUrl: mockOrganization.avatarUrl
        },
        token: mockToken
      });
    });
    
    it('should return 400 if code is missing', async () => {
      // Make request without code
      const response = await request(app)
        .post('/auth/login')
        .send({})
        .expect(400);
      
      expect(response.body.error).toBe('GitHub OAuth code is required');
      expect(authenticateUser).not.toHaveBeenCalled();
    });
    
    it('should return 401 if authentication fails', async () => {
      // Mock authentication failure
      authenticateUser.mockRejectedValue(new Error('Authentication failed'));
      
      // Make request
      const response = await request(app)
        .post('/auth/login')
        .send({ code: 'invalid-code' })
        .expect(401);
      
      expect(response.body.error).toBe('Authentication failed');
    });
  });

  describe('GET /auth/verify', () => {
    it('should verify token and return user data', async () => {
      // Mock successful verification
      const decodedToken = {
        userId: 1,
        githubId: '12345',
        username: 'testuser'
      };
      
      verifyToken.mockReturnValue(decodedToken);
      
      // Make request
      const response = await request(app)
        .get('/auth/verify')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);
      
      // Verify token was verified
      expect(verifyToken).toHaveBeenCalledWith('valid-token');
      
      // Verify response
      expect(response.body).toEqual({
        valid: true,
        user: {
          id: decodedToken.userId,
          githubId: decodedToken.githubId,
          username: decodedToken.username
        }
      });
    });
    
    it('should return 401 if no token provided', async () => {
      // Make request without token
      const response = await request(app)
        .get('/auth/verify')
        .expect(401);
      
      expect(response.body.error).toBe('No token provided');
      expect(verifyToken).not.toHaveBeenCalled();
    });
    
    it('should return 401 if token verification fails', async () => {
      // Mock verification failure
      verifyToken.mockImplementation(() => {
        throw new Error('Invalid token');
      });
      
      // Make request
      const response = await request(app)
        .get('/auth/verify')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
      
      expect(response.body.error).toBe('Invalid token');
      expect(response.body.valid).toBe(false);
    });
  });

  describe('POST /auth/logout', () => {
    it('should return success message', async () => {
      // Make request
      const response = await request(app)
        .post('/auth/logout')
        .expect(200);
      
      expect(response.body).toEqual({
        success: true,
        message: 'Logout successful'
      });
    });
  });
}); 