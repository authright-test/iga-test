import { Organization } from '../../models/index.js';
import logger from '../../utils/logger.js';
import { syncOrganizationWithGitHub } from '../../services/organizationService.js';
import { getGitHubApp } from '../../utils/github.js';

/**
 * Handle GitHub App installation created event
 * @param {Object} payload - Webhook payload
 */
export const handleInstallationCreated = async (payload) => {
  try {
    const { installation, repositories, sender } = payload;
    const githubApp = await getGitHubApp();

    // Get installation access token
    const octokit = await githubApp.getInstallationOctokit(installation.id);

    // Get organization details
    const { data: orgData } = await octokit.orgs.get({
      org: installation.account.login
    });

    // Create or update organization in database
    const [organization, created] = await Organization.findOrCreate({
      where: { githubId: orgData.id.toString() },
      defaults: {
        name: orgData.name || orgData.login,
        login: orgData.login,
        avatarUrl: orgData.avatar_url,
        installationId: installation.id,
        description: orgData.description,
        website: orgData.blog,
        email: orgData.email,
        location: orgData.location
      }
    });

    if (!created) {
      // Update existing organization
      await organization.update({
        name: orgData.name || orgData.login,
        login: orgData.login,
        avatarUrl: orgData.avatar_url,
        installationId: installation.id,
        description: orgData.description,
        website: orgData.blog,
        email: orgData.email,
        location: orgData.location,
        isActive: true
      });
    }

    // Sync organization data with GitHub
    await syncOrganizationWithGitHub(organization.id, octokit);

    logger.info(`GitHub App installed for organization: ${organization.login}`, {
      organizationId: organization.id,
      installationId: installation.id,
      installedBy: sender.login
    });

    return organization;
  } catch (error) {
    logger.error('Error handling installation created:', error);
    throw error;
  }
};

/**
 * Handle GitHub App installation deleted event
 * @param {Object} payload - Webhook payload
 */
export const handleInstallationDeleted = async (payload) => {
  try {
    const { installation, sender } = payload;

    // Find organization by installation ID
    const organization = await Organization.findOne({
      where: { installationId: installation.id }
    });

    if (organization) {
      // Mark organization as inactive
      await organization.update({
        isActive: false,
        status: 'inactive'
      });

      logger.info(`GitHub App uninstalled from organization: ${organization.login}`, {
        organizationId: organization.id,
        installationId: installation.id,
        uninstalledBy: sender.login
      });
    }

    return organization;
  } catch (error) {
    logger.error('Error handling installation deleted:', error);
    throw error;
  }
}; 