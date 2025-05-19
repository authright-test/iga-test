import { App } from '@octokit/app';
import { Octokit } from '@octokit/rest';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Organization, User, RefreshToken } from '../models/index.js';
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
  logger.info('exchangeCodeForToken', {
    client_id: process.env.GITHUB_APP_CLIENT_ID,
    client_secret: process.env.GITHUB_APP_CLIENT_SECRET,
    code
  })

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

    // logger.info('response from github', response)

    if (!response.data.access_token) {
      throw new Error('Failed to obtain access token');
    }

    return response.data.access_token;
  } catch (error) {
    logger.error('Token exchange error:', error);
    throw new Error('Failed to exchange code for token');
  }
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
 * Generate a refresh token
 * @param {Object} user - User object from database
 * @returns {Promise<string>} Refresh token
 */
const generateRefreshToken = async (user) => {
  // Generate a random token
  const token = crypto.randomBytes(40).toString('hex');

  // Set expiration to 7 days from now
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  // Create refresh token in database
  await RefreshToken.create({
    token,
    userId: user.id,
    expiresAt
  });

  return token;
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
 * Generate access and refresh tokens for a user
 * @param {Object} user - User object from database
 * @param {number|null} installationId - GitHub App installation ID
 * @returns {Promise<Object>} Object containing access token and refresh token
 */
const generateTokens = async (user, installationId = null) => {
  const accessToken = jwt.sign(
    {
      userId: user.id,
      githubId: user.githubId,
      username: user.username,
      installationId: installationId
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRATION || '15m' } // Short-lived access token
  );

  const refreshToken = await generateRefreshToken(user);

  return {
    accessToken,
    refreshToken
  };
};

/**
 * Verify and refresh access token
 * @param {string} refreshToken - Refresh token
 * @returns {Promise<Object>} New access token and refresh token
 */
const refreshAccessToken = async (refreshToken) => {
  try {
    // Find refresh token in database
    const tokenRecord = await RefreshToken.findOne({
      where: {
        token: refreshToken,
        isRevoked: false
      },
      include: [User]
    });

    if (!tokenRecord) {
      throw new Error('Invalid refresh token');
    }

    // Check if token is expired
    if (new Date() > tokenRecord.expiresAt) {
      throw new Error('Refresh token expired');
    }

    // Get user
    const user = tokenRecord.User;

    // Revoke the used refresh token
    tokenRecord.isRevoked = true;
    await tokenRecord.save();

    // Generate new tokens
    const tokens = await generateTokens(user, user.installationId);

    return {
      ...tokens,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl
      }
    };
  } catch (error) {
    logger.error('Token refresh error:', error);
    throw error;
  }
};

/**
 * Revoke all refresh tokens for a user
 * @param {number} userId - User ID
 */
const revokeAllRefreshTokens = async (userId) => {
  await RefreshToken.update(
    { isRevoked: true },
    { where: { userId, isRevoked: false } }
  );
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
    logger.info('Successfully authenticated GitHub user:', githubUser);

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

    // Generate tokens
    const tokens = await generateTokens(user, installationId);

    return {
      user,
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
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

// Update logout to revoke refresh tokens
const logout = async (userId) => {
  await revokeAllRefreshTokens(userId);
};

export {
  authenticateUser,
  verifyToken,
  refreshAccessToken,
  logout,
  githubApp
};
