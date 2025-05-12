const express = require('express');
const { authenticateUser, verifyToken } = require('../services/authService');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * @route   POST /auth/login
 * @desc    Authenticate user with GitHub OAuth code
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
      token: authResult.token
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
 * @route   POST /auth/logout
 * @desc    Logout user (client-side only)
 * @access  Public
 */
router.post('/logout', (req, res) => {
  // Actual logout happens on the client side by removing the token
  res.json({ success: true, message: 'Logout successful' });
});

module.exports = router; 