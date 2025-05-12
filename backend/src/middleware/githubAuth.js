const { App } = require('@octokit/app');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const app = new App({
  appId: process.env.GITHUB_APP_ID,
  privateKey: process.env.GITHUB_APP_PRIVATE_KEY,
  webhooks: {
    secret: process.env.GITHUB_APP_WEBHOOK_SECRET
  }
});

async function githubAuthMiddleware(req, res, next) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach decoded token to request
    req.decoded = decoded;
    
    // Get installation access token
    const installationId = decoded.installationId;
    const installationAccessToken = await app.getInstallationAccessToken({
      installationId
    });

    // Attach GitHub client to request
    req.github = app.getInstallationOctokit(installationId);
    req.installationId = installationId;
    
    next();
  } catch (error) {
    logger.error('GitHub authentication error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = githubAuthMiddleware; 