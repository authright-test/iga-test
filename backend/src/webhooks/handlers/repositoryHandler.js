import { AuditLog, Organization, Repository, User } from '../../models/index.js';
import { evaluatePolicy, executePolicyActions, getOrganizationPolicies } from '../../services/policyService.js';
import logger from '../../utils/logger.js';

/**
 * Handle repository created events
 * @param {Object} payload - Webhook payload
 */
async function handleRepositoryCreated(payload) {
  try {
    logger.info('Repository created event received');

    const { sender, repository, organization } = payload;

    // Get organization from database
    const orgRecord = await Organization.findOne({
      where: { githubId: organization.id.toString() }
    });

    if (!orgRecord) {
      logger.warn(`Organization not found: ${organization.login}`);
      return;
    }

    // Find or create the sender
    const [senderRecord] = await User.findOrCreate({
      where: { githubId: sender.id.toString() },
      defaults: {
        username: sender.login,
        avatarUrl: sender.avatar_url
      }
    });

    // Create or update repository record
    const [repoRecord, created] = await Repository.findOrCreate({
      where: { githubId: repository.id.toString() },
      defaults: {
        name: repository.name,
        fullName: repository.full_name,
        private: repository.private,
        description: repository.description,
        url: repository.html_url,
        OrganizationId: orgRecord.id
      }
    });

    if (!created) {
      await repoRecord.update({
        name: repository.name,
        fullName: repository.full_name,
        private: repository.private,
        description: repository.description,
        url: repository.html_url,
        OrganizationId: orgRecord.id
      });
    }

    // Create audit log
    await AuditLog.create({
      action: 'repository_created',
      resourceType: 'repository',
      resourceId: repository.id.toString(),
      details: {
        repositoryName: repository.name,
        isPrivate: repository.private,
        organizationName: organization.login
      },
      UserId: senderRecord.id
    });

    // Check policies
    const policies = await getOrganizationPolicies(orgRecord.id);

    // Process applicable policies
    for (const policy of policies) {
      if (!policy.isActive) continue;

      const isViolated = await evaluatePolicy(policy, payload, {
        event: 'repository_created',
        organization: orgRecord
      });

      if (isViolated) {
        logger.info(`Policy ${policy.name} violated for repository created event`);

        // Execute policy actions
        await executePolicyActions(policy, payload, {
          event: 'repository_created',
          organization: orgRecord,
          resourceType: 'repository',
          resourceId: repository.id.toString(),
          userId: senderRecord.id,
          installationId: orgRecord.installationId
        });
      }
    }
  } catch (error) {
    logger.error('Error handling repository created event:', error);
  }
}

/**
 * Handle repository deleted events
 * @param {Object} payload - Webhook payload
 */
async function handleRepositoryDeleted(payload) {
  try {
    logger.info('Repository deleted event received');

    const { sender, repository, organization } = payload;

    // Get organization from database
    const orgRecord = await Organization.findOne({
      where: { githubId: organization.id.toString() }
    });

    if (!orgRecord) {
      logger.warn(`Organization not found: ${organization.login}`);
      return;
    }

    // Find or create the sender
    const [senderRecord] = await User.findOrCreate({
      where: { githubId: sender.id.toString() },
      defaults: {
        username: sender.login,
        avatarUrl: sender.avatar_url
      }
    });

    // Find repository record
    const repoRecord = await Repository.findOne({
      where: { githubId: repository.id.toString() }
    });

    // Create audit log
    await AuditLog.create({
      action: 'repository_deleted',
      resourceType: 'repository',
      resourceId: repository.id.toString(),
      details: {
        repositoryName: repository.name,
        organizationName: organization.login
      },
      UserId: senderRecord.id
    });

    // Update repository record if found
    if (repoRecord) {
      await repoRecord.update({
        isActive: false
      });
    }

    // Check policies
    const policies = await getOrganizationPolicies(orgRecord.id);

    // Process applicable policies
    for (const policy of policies) {
      if (!policy.isActive) continue;

      const isViolated = await evaluatePolicy(policy, payload, {
        event: 'repository_deleted',
        organization: orgRecord
      });

      if (isViolated) {
        logger.info(`Policy ${policy.name} violated for repository deleted event`);

        // Execute policy actions
        await executePolicyActions(policy, payload, {
          event: 'repository_deleted',
          organization: orgRecord,
          resourceType: 'repository',
          resourceId: repository.id.toString(),
          userId: senderRecord.id,
          installationId: orgRecord.installationId
        });
      }
    }
  } catch (error) {
    logger.error('Error handling repository deleted event:', error);
  }
}

/**
 * Handle repository visibility changed events
 * @param {Object} payload - Webhook payload
 */
async function handleRepositoryVisibilityChanged(payload) {
  try {
    logger.info('Repository visibility changed event received');

    const { sender, repository, organization, visibility } = payload;

    // Get organization from database
    const orgRecord = await Organization.findOne({
      where: { githubId: organization.id.toString() }
    });

    if (!orgRecord) {
      logger.warn(`Organization not found: ${organization.login}`);
      return;
    }

    // Find or create the sender
    const [senderRecord] = await User.findOrCreate({
      where: { githubId: sender.id.toString() },
      defaults: {
        username: sender.login,
        avatarUrl: sender.avatar_url
      }
    });

    // Find repository record
    const repoRecord = await Repository.findOne({
      where: { githubId: repository.id.toString() }
    });

    // Create audit log
    await AuditLog.create({
      action: 'repository_visibility_changed',
      resourceType: 'repository',
      resourceId: repository.id.toString(),
      details: {
        repositoryName: repository.name,
        organizationName: organization.login,
        visibility,
        isPrivate: visibility === 'private'
      },
      UserId: senderRecord.id
    });

    // Update repository record if found
    if (repoRecord) {
      await repoRecord.update({
        private: visibility === 'private'
      });
    }

    // Check policies
    const policies = await getOrganizationPolicies(orgRecord.id);

    // Process applicable policies
    for (const policy of policies) {
      if (!policy.isActive) continue;

      const isViolated = await evaluatePolicy(policy, payload, {
        event: 'repository_visibility_changed',
        organization: orgRecord
      });

      if (isViolated) {
        logger.info(`Policy ${policy.name} violated for repository visibility changed event`);

        // Execute policy actions
        await executePolicyActions(policy, payload, {
          event: 'repository_visibility_changed',
          organization: orgRecord,
          resourceType: 'repository',
          resourceId: repository.id.toString(),
          userId: senderRecord.id,
          installationId: orgRecord.installationId
        });
      }
    }
  } catch (error) {
    logger.error('Error handling repository visibility changed event:', error);
  }
}

export {
  handleRepositoryCreated,
  handleRepositoryDeleted,
  handleRepositoryVisibilityChanged
};
