const jwt = require('jsonwebtoken');
const { githubApp } = require('../services/authService');
const { User, Organization } = require('../models');
const logger = require('../utils/logger');

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

module.exports = {
  authenticateJWT,
  authenticateGitHubApp,
  isOrganizationMember,
  isOrganizationAdmin
}; 