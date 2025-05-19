import jwt from 'jsonwebtoken';
import { githubApp } from '../services/authService.js';
import { User, Organization } from '../models/index.js';
import logger from '../utils/logger.js';

/**
 * JWT Authentication Middleware
 * Verifies JWT token and attaches user to request
 */
const authenticateJWT = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findByPk(decoded.userId, {
      include: [{
        model: Organization,
        attributes: ['id', 'name', 'login', 'avatarUrl']
      }]
    });
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    logger.error('JWT authentication error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * GitHub App Authentication Middleware
 * Verifies GitHub App installation and attaches installation to request
 */
const authenticateGitHubApp = async (req, res, next) => {
  try {
    const installationId = req.headers['x-github-installation-id'];
    
    if (!installationId) {
      return res.status(401).json({ error: 'No GitHub installation ID provided' });
    }
    
    // Get installation from GitHub
    const installation = await githubApp.getInstallation(installationId);
    
    if (!installation) {
      return res.status(401).json({ error: 'Invalid GitHub installation' });
    }
    
    // Attach installation to request
    req.installation = installation;
    next();
  } catch (error) {
    logger.error('GitHub App authentication error:', error);
    return res.status(401).json({ error: 'GitHub App authentication failed' });
  }
};

/**
 * Organization Member Middleware
 * Verifies user is a member of the organization
 */
const isOrganizationMember = async (req, res, next) => {
  try {
    const { organizationId } = req.params;
    
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Check if user is a member of the organization
    const isMember = await req.user.hasOrganization(organizationId);
    
    if (!isMember) {
      return res.status(403).json({ error: 'Not a member of this organization' });
    }
    
    next();
  } catch (error) {
    logger.error('Organization member check error:', error);
    return res.status(500).json({ error: 'Failed to verify organization membership' });
  }
};

/**
 * Organization Admin Middleware
 * Verifies user is an admin of the organization
 */
const isOrganizationAdmin = async (req, res, next) => {
  try {
    const { organizationId } = req.params;
    
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Check if user is an admin of the organization
    const isAdmin = await req.user.hasOrganization(organizationId, { role: 'admin' });
    
    if (!isAdmin) {
      return res.status(403).json({ error: 'Not an admin of this organization' });
    }
    
    next();
  } catch (error) {
    logger.error('Organization admin check error:', error);
    return res.status(500).json({ error: 'Failed to verify organization admin status' });
  }
};

/**
 * Middleware to check if the user has the required permission
 * @param {string} requiredPermission - The permission required to access the route
 * @returns {Function} Express middleware function
 */
export const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      // Get user permissions from request (assuming they are set by auth middleware)
      const userPermissions = req.user?.permissions || [];

      // Check if user has the required permission
      if (!userPermissions.includes(requiredPermission)) {
        logger.warn(`Permission denied: ${requiredPermission} required`);
        return res.status(403).json({
          error: 'Permission denied',
          message: `You don't have permission to perform this action. Required permission: ${requiredPermission}`
        });
      }

      // User has the required permission, proceed to next middleware
      next();
    } catch (error) {
      logger.error('Error checking permission:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to check permissions'
      });
    }
  };
};

/**
 * Middleware to authenticate requests
 * @returns {Function} Express middleware function
 */
export const authenticate = async (req, res, next) => {
  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No authorization header provided'
      });
    }

    // Extract the token
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided'
      });
    }

    // TODO: Implement token verification and user permission retrieval
    // For now, we'll set a mock user with permissions
    req.user = {
      id: 'mock-user-id',
      permissions: [
        'teams.view',
        'teams.create',
        'teams.edit',
        'teams.delete',
        'teams.sync',
        'violations.view',
        'violations.create',
        'violations.edit',
        'violations.comment',
        'stats.view',
        'requests.view',
        'requests.create',
        'requests.approve',
        'requests.comment'
      ]
    };

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to authenticate request'
    });
  }
};

export { authenticateJWT, authenticateGitHubApp, isOrganizationMember, isOrganizationAdmin }; 