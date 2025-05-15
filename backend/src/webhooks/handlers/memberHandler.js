import { AuditLog, Organization, User } from '../../models/index.js';
import { evaluatePolicy, executePolicyActions, getOrganizationPolicies } from '../../services/policyService.js';
import logger from '../../utils/logger.js';

/**
 * Handle member added events
 * @param {Object} payload - Webhook payload
 */
async function handleMemberAdded(payload) {
  try {
    logger.info('Member added event received');

    const { sender, repository, member, organization } = payload;

    // Get organization from database
    const orgRecord = await Organization.findOne({
      where: { githubId: organization.id.toString() }
    });

    if (!orgRecord) {
      logger.warn(`Organization not found: ${organization.login}`);
      return;
    }

    // Find or create the added member
    const [userRecord] = await User.findOrCreate({
      where: { githubId: member.id.toString() },
      defaults: {
        username: member.login,
        avatarUrl: member.avatar_url
      }
    });

    // Find or create the sender
    const [senderRecord] = await User.findOrCreate({
      where: { githubId: sender.id.toString() },
      defaults: {
        username: sender.login,
        avatarUrl: sender.avatar_url
      }
    });

    // Create audit log
    await AuditLog.create({
      action: 'member_added',
      resourceType: 'repository',
      resourceId: repository.id.toString(),
      details: {
        repositoryName: repository.name,
        memberName: member.login,
        permission: payload.permission
      },
      UserId: senderRecord.id
    });

    // Check policies
    const policies = await getOrganizationPolicies(orgRecord.id);

    // Process applicable policies
    for (const policy of policies) {
      if (!policy.isActive) continue;

      const isViolated = await evaluatePolicy(policy, payload, {
        event: 'member_added',
        organization: orgRecord
      });

      if (isViolated) {
        logger.info(`Policy ${policy.name} violated for member added event`);

        // Execute policy actions
        await executePolicyActions(policy, payload, {
          event: 'member_added',
          organization: orgRecord,
          resourceType: 'repository',
          resourceId: repository.id.toString(),
          userId: senderRecord.id,
          installationId: orgRecord.installationId
        });
      }
    }
  } catch (error) {
    logger.error('Error handling member added event:', error);
  }
}

/**
 * Handle member removed events
 * @param {Object} payload - Webhook payload
 */
async function handleMemberRemoved(payload) {
  try {
    logger.info('Member removed event received');

    const { sender, repository, member, organization } = payload;

    // Get organization from database
    const orgRecord = await Organization.findOne({
      where: { githubId: organization.id.toString() }
    });

    if (!orgRecord) {
      logger.warn(`Organization not found: ${organization.login}`);
      return;
    }

    // Find or create the removed member
    const [userRecord] = await User.findOrCreate({
      where: { githubId: member.id.toString() },
      defaults: {
        username: member.login,
        avatarUrl: member.avatar_url
      }
    });

    // Find or create the sender
    const [senderRecord] = await User.findOrCreate({
      where: { githubId: sender.id.toString() },
      defaults: {
        username: sender.login,
        avatarUrl: sender.avatar_url
      }
    });

    // Create audit log
    await AuditLog.create({
      action: 'member_removed',
      resourceType: 'repository',
      resourceId: repository.id.toString(),
      details: {
        repositoryName: repository.name,
        memberName: member.login,
        permission: payload.permission
      },
      UserId: senderRecord.id
    });

    // Check policies
    const policies = await getOrganizationPolicies(orgRecord.id);

    // Process applicable policies
    for (const policy of policies) {
      if (!policy.isActive) continue;

      const isViolated = await evaluatePolicy(policy, payload, {
        event: 'member_removed',
        organization: orgRecord
      });

      if (isViolated) {
        logger.info(`Policy ${policy.name} violated for member removed event`);

        // Execute policy actions
        await executePolicyActions(policy, payload, {
          event: 'member_removed',
          organization: orgRecord,
          resourceType: 'repository',
          resourceId: repository.id.toString(),
          userId: senderRecord.id,
          installationId: orgRecord.installationId
        });
      }
    }
  } catch (error) {
    logger.error('Error handling member removed event:', error);
  }
}

/**
 * Handle member updated events
 * @param {Object} payload - Webhook payload
 */
async function handleMemberUpdated(payload) {
  try {
    logger.info('Member updated event received');

    const { sender, repository, member, changes, organization } = payload;

    // Get organization from database
    const orgRecord = await Organization.findOne({
      where: { githubId: organization.id.toString() }
    });

    if (!orgRecord) {
      logger.warn(`Organization not found: ${organization.login}`);
      return;
    }

    // Find or create the updated member
    const [userRecord] = await User.findOrCreate({
      where: { githubId: member.id.toString() },
      defaults: {
        username: member.login,
        avatarUrl: member.avatar_url
      }
    });

    // Find or create the sender
    const [senderRecord] = await User.findOrCreate({
      where: { githubId: sender.id.toString() },
      defaults: {
        username: sender.login,
        avatarUrl: sender.avatar_url
      }
    });

    // Create audit log
    await AuditLog.create({
      action: 'member_updated',
      resourceType: 'repository',
      resourceId: repository.id.toString(),
      details: {
        repositoryName: repository.name,
        memberName: member.login,
        oldPermission: changes.permission?.from,
        newPermission: payload.permission,
        changes
      },
      UserId: senderRecord.id
    });

    // Check policies
    const policies = await getOrganizationPolicies(orgRecord.id);

    // Process applicable policies
    for (const policy of policies) {
      if (!policy.isActive) continue;

      const isViolated = await evaluatePolicy(policy, payload, {
        event: 'member_updated',
        organization: orgRecord
      });

      if (isViolated) {
        logger.info(`Policy ${policy.name} violated for member updated event`);

        // Execute policy actions
        await executePolicyActions(policy, payload, {
          event: 'member_updated',
          organization: orgRecord,
          resourceType: 'repository',
          resourceId: repository.id.toString(),
          userId: senderRecord.id,
          installationId: orgRecord.installationId
        });
      }
    }
  } catch (error) {
    logger.error('Error handling member updated event:', error);
  }
}

export {
  handleMemberAdded,
  handleMemberRemoved,
  handleMemberUpdated
};
