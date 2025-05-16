import express from 'express';
import { authenticateUser, verifyToken, refreshAccessToken, logout } from '../services/authService.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * @route   GET /auth/github
 * @desc    Redirect to GitHub OAuth page
 * @access  Public
 */
router.get('/github', (req, res) => {
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_APP_CLIENT_ID}&redirect_uri=${process.env.GITHUB_CALLBACK_URL}&scope=user:email`;
  logger.info('Redirecting to GitHub OAuth URL:', githubAuthUrl);
  res.redirect(githubAuthUrl);
});

/**
 * @route   GET /auth/github/callback
 * @desc    Handle GitHub OAuth callback
 * @access  Public
 */
router.get('/github/callback', async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_code`);
    }

    const authResult = await authenticateUser(code);

    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/oauth-callback?token=${authResult.token}`);
  } catch (error) {
    logger.error('GitHub OAuth callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
  }
});

/**
 * @route   POST /auth/login
 * @desc    Authenticate user with GitHub OAuth code (API endpoint)
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'GitHub OAuth code is required' });
    }

    const authResult = await authenticateUser(code);

    res.json({
      user: {
        id: authResult.user.id,
        username: authResult.user.username,
        email: authResult.user.email,
        avatarUrl: authResult.user.avatarUrl
      },
      organization: {
        id: authResult.organization.id,
        name: authResult.organization.name,
        login: authResult.organization.login,
        avatarUrl: authResult.organization.avatarUrl
      },
      token: authResult.token,
      refreshToken: authResult.refreshToken
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(401).json({ error: error.message || 'Authentication failed' });
  }
});

/**
 * @route   GET /auth/verify
 * @desc    Verify JWT token
 * @access  Public
 */
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = verifyToken(token);

    res.json({
      valid: true,
      user: {
        id: decoded.userId,
        githubId: decoded.githubId,
        username: decoded.username
      }
    });
  } catch (error) {
    logger.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid token', valid: false });
  }
});

/**
 * @route   POST /auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    const result = await refreshAccessToken(refreshToken);

    res.json({
      token: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user
    });
  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(401).json({ error: error.message || 'Token refresh failed' });
  }
});

/**
 * @route   POST /auth/logout
 * @desc    Logout user and revoke refresh tokens
 * @access  Private
 */
router.post('/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = verifyToken(token);
    await logout(decoded.userId);

    res.json({ success: true, message: 'Logout successful' });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(401).json({ error: 'Logout failed' });
  }
});

export default router;
