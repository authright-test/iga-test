import { Octokit } from '@octokit/rest';
import { AuditLog, Organization, Policy } from '../models/index.js';
import logger from '../utils/logger.js';
import { githubApp } from './authService.js';

/**
 * Evaluate a policy against an event
 * @param {Object} policy - Policy object
 * @param {Object} event - Event data to evaluate
 * @param {Object} context - Additional context
 * @returns {boolean} Whether policy is violated
 */
const evaluatePolicy = async (policy, event, context) => {
  try {
    const conditions = policy.conditions;

    // Simple condition evaluation for now
    // In a real-world scenario, this would be more sophisticated
    for (const condition of conditions) {
      switch (condition.type) {
        case 'equals':
          if (getValueFromPath(event, condition.field) !== condition.value) {
            return false;
          }
          break;
        case 'contains':
          if (!getValueFromPath(event, condition.field)?.includes(condition.value)) {
            return false;
          }
          break;
        case 'not_equals':
          if (getValueFromPath(event, condition.field) === condition.value) {
            return false;
          }
          break;
        case 'greater_than':
          if (getValueFromPath(event, condition.field) <= condition.value) {
            return false;
          }
          break;
        case 'less_than':
          if (getValueFromPath(event, condition.field) >= condition.value) {
            return false;
          }
          break;
      }
    }

    return true;
  } catch (error) {
    logger.error('Policy evaluation error:', error);
    return false;
  }
};

/**
 * Helper function to get nested value from an object
 * @param {Object} obj - The object
 * @param {string} path - Dot-separated path
 * @returns {any} The value
 */
const getValueFromPath = (obj, path) => {
  return path.split('.').reduce((o, key) => o?.[key], obj);
};

/**
 * Execute actions for a violated policy
 * @param {Object} policy - Policy object
 * @param {Object} event - Event data
 * @param {Object} context - Additional context
 * @returns {boolean} Success status
 */
const executePolicyActions = async (policy, event, context) => {
  try {
    const actions = policy.actions;
    const installationId = context.installationId;

    // Get installation access token
    const installationAccessToken = await githubApp.getInstallationAccessToken({
      installationId
    });

    // Create Octokit instance with installation token
    const octokit = new Octokit({
      auth: installationAccessToken
    });

    for (const action of actions) {
      switch (action.type) {
        case 'revert_change':
          // Example: revert repository visibility change
          if (event.action === 'publicized' && event.repository) {
            await octokit.repos.update({
              owner: event.repository.owner.login,
              repo: event.repository.name,
              private: true
            });
          }
          break;
        case 'notify_admin':
          // In a real app, you would send an email or notification
          logger.info(`Policy violation notification: ${policy.name}`, {
            policy,
            event
          });
          break;
        case 'remove_permission':
          // Example: remove user from repository
          if (event.member && event.repository) {
            await octokit.repos.removeCollaborator({
              owner: event.repository.owner.login,
              repo: event.repository.name,
              username: event.member.login
            });
          }
          break;
        case 'log_event':
          // Already logged by default
          break;
      }
    }

    // Log the policy enforcement in the audit log
    await AuditLog.create({
      action: 'policy_enforced',
      resourceType: context.resourceType,
      resourceId: context.resourceId,
      details: {
        policyId: policy.id,
        policyName: policy.name,
        event
      },
      UserId: context.userId
    });

    return true;
  } catch (error) {
    logger.error('Policy action execution error:', error);
    return false;
  }
};

/**
 * Create a new policy
 * @param {Object} policyData - Policy data
 * @param {number} organizationId - Organization ID
 * @param {number} userId - User ID creating the policy
 * @returns {Object} Created policy
 */
const createPolicy = async (policyData, organizationId, userId) => {
  try {
    const policy = await Policy.create({
      name: policyData.name,
      description: policyData.description,
      conditions: policyData.conditions,
      actions: policyData.actions,
      severity: policyData.severity || 'medium',
      isActive: policyData.isActive !== undefined ? policyData.isActive : true
    });

    // Associate policy with organization
    const organization = await Organization.findByPk(organizationId);
    if (organization) {
      await policy.addOrganization(organization);
    }

    // Log policy creation
    await AuditLog.create({
      action: 'policy_created',
      resourceType: 'policy',
      resourceId: policy.id.toString(),
      details: {
        policyName: policy.name,
        organizationId
      },
      UserId: userId
    });

    return policy;
  } catch (error) {
    logger.error('Error creating policy:', error);
    throw error;
  }
};

/**
 * Update an existing policy
 * @param {number} policyId - Policy ID
 * @param {Object} policyData - Updated policy data
 * @param {number} userId - User ID updating the policy
 * @returns {Object} Updated policy
 */
const updatePolicy = async (policyId, policyData, userId) => {
  try {
    const policy = await Policy.findByPk(policyId);

    if (!policy) {
      throw new Error('Policy not found');
    }

    // Update policy
    await policy.update({
      name: policyData.name || policy.name,
      description: policyData.description || policy.description,
      conditions: policyData.conditions || policy.conditions,
      actions: policyData.actions || policy.actions,
      severity: policyData.severity || policy.severity,
      isActive: policyData.isActive !== undefined ? policyData.isActive : policy.isActive
    });

    // Log policy update
    await AuditLog.create({
      action: 'policy_updated',
      resourceType: 'policy',
      resourceId: policy.id.toString(),
      details: {
        policyName: policy.name,
        changes: policyData
      },
      UserId: userId
    });

    return policy;
  } catch (error) {
    logger.error('Error updating policy:', error);
    throw error;
  }
};

/**
 * Delete a policy
 * @param {number} policyId - Policy ID
 * @param {number} userId - User ID deleting the policy
 * @returns {boolean} Success status
 */
const deletePolicy = async (policyId, userId) => {
  try {
    const policy = await Policy.findByPk(policyId);

    if (!policy) {
      throw new Error('Policy not found');
    }

    // Log policy deletion before deleting
    await AuditLog.create({
      action: 'policy_deleted',
      resourceType: 'policy',
      resourceId: policy.id.toString(),
      details: {
        policyName: policy.name
      },
      UserId: userId
    });

    // Delete policy
    await policy.destroy();

    return true;
  } catch (error) {
    logger.error('Error deleting policy:', error);
    throw error;
  }
};

/**
 * Get policies for an organization
 * @param {number} organizationId - Organization ID
 * @returns {Array} List of policies
 */
const getOrganizationPolicies = async (organizationId) => {
  try {
    const organization = await Organization.findByPk(organizationId, {
      include: [Policy]
    });

    if (!organization) {
      return [];
    }

    return organization.Policies;
  } catch (error) {
    logger.error('Error getting organization policies:', error);
    return [];
  }
};

export {
  createPolicy,
  updatePolicy,
  deletePolicy,
  getOrganizationPolicies,
  evaluatePolicy,
  executePolicyActions
};
