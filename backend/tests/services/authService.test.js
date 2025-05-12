const jwt = require('jsonwebtoken');
const { generateToken, verifyToken } = require('../../src/services/authService');
const { User } = require('../../src/models');

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('../../src/models', () => ({
  User: {
    findOrCreate: jest.fn(),
    findByPk: jest.fn()
  }
}));
jest.mock('@octokit/app');
jest.mock('@octokit/auth-app');
jest.mock('@octokit/rest');
jest.mock('../../src/utils/logger');

describe('Auth Service', () => {
  let mockUser;
  let mockInstallationId;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup test data
    mockUser = {
      id: 1,
      githubId: '12345',
      username: 'testuser'
    };
    mockInstallationId = 67890;
    
    // Mock environment variables
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRATION = '1h';
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token with user data', () => {
      // Mock JWT sign function
      jwt.sign.mockReturnValue('mocked-token');
      
      // Call the function
      const token = generateToken(mockUser, mockInstallationId);
      
      // Assertions
      expect(jwt.sign).toHaveBeenCalledWith(
        {
          userId: mockUser.id,
          githubId: mockUser.githubId,
          username: mockUser.username,
          installationId: mockInstallationId
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION }
      );
      expect(token).toBe('mocked-token');
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token and return decoded data', () => {
      // Mock decoded data
      const mockDecodedData = {
        userId: mockUser.id,
        githubId: mockUser.githubId,
        username: mockUser.username
      };
      
      // Mock JWT verify function
      jwt.verify.mockReturnValue(mockDecodedData);
      
      // Call the function
      const result = verifyToken('valid-token');
      
      // Assertions
      expect(jwt.verify).toHaveBeenCalledWith('valid-token', process.env.JWT_SECRET);
      expect(result).toEqual(mockDecodedData);
    });
    
    it('should throw an error when token is invalid', () => {
      // Mock JWT verify to throw an error
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });
      
      // Call the function and expect it to throw
      expect(() => {
        verifyToken('invalid-token');
      }).toThrow('Invalid token');
    });
  });
}); 