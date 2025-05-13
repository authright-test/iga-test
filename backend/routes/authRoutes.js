const express = require('express');
const router = express.Router();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { User } = require('../models/user');

/**
 * GitHub OAuth login route
 * Redirects user to GitHub authorization page
 */
router.get('/github', (req, res) => {
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${process.env.GITHUB_CALLBACK_URL}&scope=user:email`;
  res.redirect(githubAuthUrl);
});

/**
 * GitHub OAuth callback route
 * Handles the OAuth callback from GitHub
 */
router.get('/github/callback', async (req, res) => {
  try {
    const { code } = req.query;
    
    // Exchange code for access token
    const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: process.env.GITHUB_CALLBACK_URL
    }, {
      headers: {
        Accept: 'application/json'
      }
    });

    const { access_token } = tokenResponse.data;

    // Get user data from GitHub
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `token ${access_token}`
      }
    });

    const { login, id, avatar_url, name, email } = userResponse.data;

    // Find or create user
    let user = await User.findOne({ githubId: id });
    
    if (!user) {
      user = await User.create({
        githubId: id,
        username: login,
        email: email,
        name: name || login,
        avatarUrl: avatar_url,
        githubToken: access_token
      });
    } else {
      // Update existing user
      user.githubToken = access_token;
      user.avatarUrl = avatar_url;
      user.name = name || login;
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        githubId: user.githubId,
        username: user.username
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/oauth-callback?token=${token}`);
  } catch (error) {
    console.error('GitHub OAuth Error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
  }
});

/**
 * Verify authentication token
 */
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        avatarUrl: user.avatarUrl
      }
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

/**
 * Logout route
 */
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = { router }; 