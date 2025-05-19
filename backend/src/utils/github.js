import { App } from '@octokit/app';
import { Octokit } from '@octokit/rest';
import logger from './logger.js';

let githubApp = null;

/**
 * Get GitHub App instance
 * @returns {Promise<App>} GitHub App instance
 */
export const getGitHubApp = async () => {
  if (!githubApp) {
    try {
      githubApp = new App({
        appId: process.env.GITHUB_APP_ID,
        privateKey: process.env.GITHUB_APP_PRIVATE_KEY,
        clientId: process.env.GITHUB_APP_CLIENT_ID,
        clientSecret: process.env.GITHUB_APP_CLIENT_SECRET
      });
    } catch (error) {
      logger.error('Error creating GitHub App instance:', error);
      throw error;
    }
  }
  return githubApp;
};

/**
 * Get Octokit instance for an installation
 * @param {number} installationId - Installation ID
 * @returns {Promise<Octokit>} Octokit instance
 */
export const getInstallationOctokit = async (installationId) => {
  try {
    const app = await getGitHubApp();
    const { token } = await app.getInstallationAccessToken({
      installationId
    });
    return new Octokit({ auth: token });
  } catch (error) {
    logger.error('Error getting installation Octokit:', error);
    throw error;
  }
};

/**
 * Get installation details
 * @param {number} installationId - Installation ID
 * @returns {Promise<Object>} Installation details
 */
export const getInstallation = async (installationId) => {
  try {
    const app = await getGitHubApp();
    return await app.getInstallation(installationId);
  } catch (error) {
    logger.error('Error getting installation:', error);
    throw error;
  }
};

/**
 * List installations for the app
 * @returns {Promise<Array>} List of installations
 */
export const listInstallations = async () => {
  try {
    const app = await getGitHubApp();
    const { data: installations } = await app.octokit.request('GET /app/installations');
    return installations;
  } catch (error) {
    logger.error('Error listing installations:', error);
    throw error;
  }
}; 