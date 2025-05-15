import { App } from '@octokit/app';
import { Octokit } from '@octokit/rest';
import jwt from 'jsonwebtoken';
import { Organization, User } from '../models/index.js';
import logger from '../utils/logger.js';

// GitHub App instance
const githubApp = new App({
  appId: process.env.GITHUB_APP_ID,
  privateKey: process.env.GITHUB_APP_PRIVATE_KEY
});

/**
 * Generate a JWT token for a user
 * @param {Object} user - User object from database
 * @param {number} installationId - GitHub App installation ID
 * @returns {string} JWT token
 */
const generateToken = (user, installationId) => {
  return jwt.sign(
    {
      userId: user.id,
      githubId: user.githubId,
      username: user.username,
      installationId: installationId
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRATION || '24h' }
  );
};

/**
 * Authenticate a user with GitHub
 * @param {string} code - OAuth code from GitHub
 * @returns {Object} User and token
 */
const authenticateUser = async (code) => {
  try {
    // Exchange code for token
    const octokit = new Octokit({
      auth: {
        clientId: process.env.GITHUB_APP_CLIENT_ID,
        clientSecret: process.env.GITHUB_APP_CLIENT_SECRET,
        code
      },
      request: {
        fetch: require('node-fetch')
      }
    });

    // Get authenticated user info
    const { data: githubUser } = await octokit.users.getAuthenticated();

    // Find or create user in database
    let [user, created] = await User.findOrCreate({
      where: { githubId: githubUser.id.toString() },
      defaults: {
        username: githubUser.login,
        email: githubUser.email,
        avatarUrl: githubUser.avatar_url
      }
    });

    if (!created) {
      // Update user information
      user.username = githubUser.login;
      user.email = githubUser.email;
      user.avatarUrl = githubUser.avatar_url;
      user.lastLogin = new Date();
      await user.save();
    }

    // Get all installations for the user
    const installations = await githubApp.octokit.apps.listInstallationsForAuthenticatedUser();

    if (installations.data.installations.length === 0) {
      throw new Error('No GitHub App installations found for this user');
    }

    // Use the first installation
    const installationId = installations.data.installations[0].id;

    // Get the installation access token
    const installationAccessToken = await githubApp.getInstallationAccessToken({
      installationId
    });

    // Create Octokit instance with installation token
    const installationOctokit = new Octokit({
      auth: installationAccessToken
    });

    // Get organization information
    const { data: orgData } = await installationOctokit.orgs.get({
      org: installations.data.installations[0].account.login
    });

    // Store organization in database
    const [organization] = await Organization.findOrCreate({
      where: { githubId: orgData.id.toString() },
      defaults: {
        name: orgData.name || orgData.login,
        login: orgData.login,
        avatarUrl: orgData.avatar_url,
        installationId
      }
    });

    // Associate user with organization
    await user.addOrganization(organization);

    // Generate JWT token
    const token = generateToken(user, installationId);

    return {
      user,
      token,
      organization
    };
  } catch (error) {
    logger.error('Authentication error:', error);
    throw error;
  }
};

/**
 * Verify a JWT token and return the user
 * @param {string} token - JWT token
 * @returns {Object} Decoded token data
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    logger.error('Token verification error:', error);
    throw new Error('Invalid token');
  }
};

export {
  authenticateUser,
  generateToken,
  verifyToken,
  githubApp
};
