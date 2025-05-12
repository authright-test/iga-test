const { requireAuth } = require('../../src/middleware/authMiddleware');
const { verifyToken } = require('../../src/services/authService');

// Mock dependencies
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
      }
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    next = jest.fn();
  });

  it('should call next() when token is valid', () => {
    // Mock successful token verification
    verifyToken.mockReturnValue({
      userId: 1,
      githubId: '12345',
      username: 'testuser'
    });
    
    // Call middleware
    requireAuth(req, res, next);
    
    // Check token was verified
    expect(verifyToken).toHaveBeenCalledWith('valid-token');
    
    // Check user was added to request
    expect(req.user).toEqual({
      id: 1,
      githubId: '12345',
      username: 'testuser'
    });
    
    // Check next was called
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should return 401 when Authorization header is missing', () => {
    // Remove Authorization header
    req.headers = {};
    
    // Call middleware
    requireAuth(req, res, next);
    
    // Check response
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Authorization required' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 when token is invalid', () => {
    // Mock token verification failure
    verifyToken.mockImplementation(() => {
      throw new Error('Invalid token');
    });
    
    // Call middleware
    requireAuth(req, res, next);
    
    // Check response
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 when token format is invalid', () => {
    // Use invalid token format
    req.headers.authorization = 'invalid-format';
    
    // Call middleware
    requireAuth(req, res, next);
    
    // Check response
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token format' });
    expect(next).not.toHaveBeenCalled();
  });
}); 