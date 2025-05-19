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
 * @param {string} permission - The permission required to access the route
 * @returns {Function} Express middleware function
 */
export const checkPermission = (permission) => {
  return async (req, res, next) => {
    try {
      // FIXME 暂时屏蔽
      // const user = req.user;
      // if (!user) {
      //   return res.status(401).json({ error: 'Unauthorized' });
      // }
      //
      // // 检查用户是否有权限
      // const hasPermission = await user.hasPermission(permission);
      // if (!hasPermission) {
      //   return res.status(403).json({ error: 'Forbidden' });
      // }
      //
      // // 对于组织相关的操作，检查用户是否是组织成员
      // if (req.params.id) {
      //   const organization = await Organization.findByPk(req.params.id);
      //   if (!organization) {
      //     return res.status(404).json({ error: 'Organization not found' });
      //   }
      //
      //   // 检查用户是否是组织成员
      //   const isMember = await organization.hasMember(user.id);
      //   if (!isMember) {
      //     return res.status(403).json({ error: 'You are not a member of this organization' });
      //   }
      //
      //   // 对于更新和删除操作，检查用户是否有足够的权限
      //   if (req.method === 'PUT' || req.method === 'DELETE') {
      //     const isAdmin = await user.hasRole('admin', organization.id);
      //     if (!isAdmin) {
      //       return res.status(403).json({ error: 'You do not have permission to modify this organization' });
      //     }
      //   }
      // }

      next();
    } catch (error) {
      logger.error('Error in checkPermission middleware:', error);
      res.status(500).json({ error: 'Internal server error' });
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
