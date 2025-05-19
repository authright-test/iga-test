import { Octokit } from '@octokit/rest';
import { Organization } from '../models/index.js';
import { syncOrganizationWithGitHub } from '../services/organizationService.js';
import logger from '../utils/logger.js';
import { getGitHubApp } from '../utils/github.js';

/**
 * Sync all organizations with GitHub
 */
export const syncOrganizations = async () => {
  try {
    logger.info('Starting organization sync with GitHub');

    // 获取所有活跃的组织
    const organizations = await Organization.findAll({
      where: { isActive: true }
    });

    logger.info(`Found ${organizations.length} active organizations to sync`);

    // 获取 GitHub App 实例
    const githubApp = await getGitHubApp();

    // 同步每个组织
    for (const organization of organizations) {
      try {
        // 获取组织的安装令牌
        const installation = await githubApp.getInstallation(organization.installationId);
        const octokit = await githubApp.getInstallationOctokit(organization.installationId);

        // 同步组织数据
        await syncOrganizationWithGitHub(organization.id, octokit);

        logger.info(`Successfully synced organization: ${organization.login}`);
      } catch (error) {
        logger.error(`Error syncing organization ${organization.login}:`, error);
        // 继续处理下一个组织
        continue;
      }
    }

    logger.info('Completed organization sync with GitHub');
  } catch (error) {
    logger.error('Error in syncOrganizations task:', error);
    throw error;
  }
};

/**
 * Schedule organization sync
 */
export const scheduleOrganizationSync = (scheduler) => {
  // 每小时同步一次
  scheduler.scheduleJob('0 * * * *', async () => {
    try {
      await syncOrganizations();
    } catch (error) {
      logger.error('Error in scheduled organization sync:', error);
    }
  });

  logger.info('Scheduled organization sync task');
}; 