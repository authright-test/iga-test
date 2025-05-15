import { App } from '@octokit/app';
import { Octokit } from '@octokit/rest';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { Organization, User } from '../models/index.js';
import logger from '../utils/logger.js';

// GitHub App instance
const githubApp = new App({
  appId: process.env.GITHUB_APP_ID,
  privateKey: process.env.GITHUB_APP_PRIVATE_KEY
});

/**
 * Exchange OAuth code for user access token
 * @param {string} code - OAuth code from GitHub
 * @returns {Promise<string>} User access token
 */
const exchangeCodeForToken = async (code) => {
  try {
    const response = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: process.env.GITHUB_APP_CLIENT_ID,
      client_secret: process.env.GITHUB_APP_CLIENT_SECRET,
      code
    }, {
      headers: {
        Accept: 'application/json'
      }
    });

    if (!response.data.access_token) {
      throw new Error('Failed to obtain access token');
    }

    return response.data.access_token;
  } catch (error) {
    logger.error('Token exchange error:', error.response?.data || error.message);
    throw new Error('Failed to exchange code for token');
  }
};

/**
 * Generate a JWT token for a user
 * @param {Object} user - User object from database
 * @param {number|null} installationId - GitHub App installation ID
 * @returns {string} JWT token
 */
const generateToken = (user, installationId = null) => {
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
 * Get GitHub App installation for a user
 * @param {Octokit} userOctokit - Octokit instance with user access token
 * @returns {Promise<Object|null>} Installation information or null
 */
const getInstallationForUser = async (userOctokit) => {
  try {
    // Get all installations for the authenticated user
    const { data: installations } = await userOctokit.request('GET /user/installations', {
      per_page: 100
    });

    if (!installations.installations || installations.installations.length === 0) {
      logger.info('No GitHub App installations found for user');
      return null;
    }

    // Get the first installation
    const installation = installations.installations[0];

    // Get installation access token for the GitHub App
    const { token: installationToken } = await githubApp.getInstallationAccessToken({
      installationId: installation.id
    });

    return {
      installation,
      installationToken
    };
  } catch (error) {
    logger.error('Error getting installation:', error);
    return null;
  }
};

/**
 * Authenticate a user with GitHub
 * @param {string} code - OAuth code from GitHub
 * @returns {Object} User and token
 */
const authenticateUser = async (code) => {
  try {
    // Step 1: Exchange OAuth code for user access token
    const userAccessToken = await exchangeCodeForToken(code);
    logger.info('Successfully obtained user access token');

    // Step 2: Create Octokit instance with user access token
    const userOctokit = new Octokit({
      auth: userAccessToken
    });

    // Step 3: Get authenticated user info using user access token
    const { data: githubUser } = await userOctokit.users.getAuthenticated();
    logger.info('Successfully authenticated GitHub user:', githubUser.login);

    // Step 4: Find or create user in database
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

    let organization = null;
    let installationId = null;

    // Step 5: Try to get GitHub App installation information
    const installationInfo = await getInstallationForUser(userOctokit);

    if (installationInfo) {
      logger.info('Successfully obtained GitHub App installation token');
      const { installation, installationToken } = installationInfo;

      // Step 6: Create Octokit instance with installation token for app-level operations
      const appOctokit = new Octokit({
        auth: installationToken
      });

      try {
        // Step 7: Get organization information using app token
        const { data: orgData } = await appOctokit.orgs.get({
          org: installation.account.login
        });

        // Step 8: Store organization in database
        [organization] = await Organization.findOrCreate({
          where: { githubId: orgData.id.toString() },
          defaults: {
            name: orgData.name || orgData.login,
            login: orgData.login,
            avatarUrl: orgData.avatar_url,
            installationId: installation.id
          }
        });

        // Step 9: Associate user with organization
        await user.addOrganization(organization);
        installationId = installation.id;
      } catch (error) {
        logger.error('Error getting organization info:', error);
      }
    } else {
      logger.info('User does not have GitHub App installed');
    }

    // Step 10: Generate JWT token for our application
    const jwtToken = generateToken(user, installationId);

    return {
      user,
      token: jwtToken,
      organization,
      hasAppInstalled: !!installationInfo
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
