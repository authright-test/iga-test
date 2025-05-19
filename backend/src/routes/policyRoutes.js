import express from 'express';
import { Policy, Organization } from '../models/index.js';
import { checkPermission } from '../middleware/auth.js';
import { createPolicy, updatePolicy, deletePolicy, getOrganizationPolicies } from '../services/policyService.js';
import { createAuditLog } from '../services/auditService.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * @route   GET /api/policies
 * @desc    Get all policies for current organization
 * @access  Private
 */
router.get('/', checkPermission('view:policies'), async (req, res) => {
  try {
    const organizationId = req.query.organizationId;

    if (!organizationId) {
      return res.status(400).json({ error: 'Organization ID is required' });
    }

    const policies = await getOrganizationPolicies(organizationId);

    res.json(policies);
  } catch (error) {
    logger.error('Error getting policies:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/policies/:id
 * @desc    Get policy by ID
 * @access  Private
 */
router.get('/:id', checkPermission('view:policies'), async (req, res) => {
  try {
    const policy = await Policy.findByPk(req.params.id, {
      include: [Organization]
    });

    if (!policy) {
      return res.status(404).json({ error: 'Policy not found' });
    }

    res.json(policy);
  } catch (error) {
    logger.error('Error getting policy:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/policies
 * @desc    Create a new policy
 * @access  Private
 */
router.post('/', checkPermission('create:policies'), async (req, res) => {
  try {
    const { name, description, conditions, actions, severity, isActive, organizationId } = req.body;

    if (!name || !conditions || !actions || !organizationId) {
      return res.status(400).json({ error: 'Name, conditions, actions, and organization ID are required' });
    }

    const policy = await createPolicy(
      { name, description, conditions, actions, severity, isActive },
      organizationId,
      req.user.id
    );

    res.status(201).json(policy);
  } catch (error) {
    logger.error('Error creating policy:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   PUT /api/policies/:id
 * @desc    Update a policy
 * @access  Private
 */
router.put('/:id', checkPermission('update:policies'), async (req, res) => {
  try {
    const { name, description, conditions, actions, severity, isActive } = req.body;

    const policy = await updatePolicy(
      req.params.id,
      { name, description, conditions, actions, severity, isActive },
      req.user.id
    );

    res.json(policy);
  } catch (error) {
    logger.error('Error updating policy:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   DELETE /api/policies/:id
 * @desc    Delete a policy
 * @access  Private
 */
router.delete('/:id', checkPermission('delete:policies'), async (req, res) => {
  try {
    const success = await deletePolicy(req.params.id, req.user.id);

    if (!success) {
      return res.status(400).json({ error: 'Failed to delete policy' });
    }

    res.json({ message: 'Policy deleted successfully' });
  } catch (error) {
    logger.error('Error deleting policy:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/policies/:id/activate
 * @desc    Activate a policy
 * @access  Private
 */
router.post('/:id/activate', checkPermission('update:policies'), async (req, res) => {
  try {
    const policy = await Policy.findByPk(req.params.id);

    if (!policy) {
      return res.status(404).json({ error: 'Policy not found' });
    }

    // Update policy status
    await policy.update({ isActive: true });

    // Audit log
    await createAuditLog({
      action: 'policy_activated',
      resourceType: 'policy',
      resourceId: policy.id.toString(),
      details: {
        policyName: policy.name
      },
      userId: req.user.id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json(policy);
  } catch (error) {
    logger.error('Error activating policy:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/policies/:id/deactivate
 * @desc    Deactivate a policy
 * @access  Private
 */
router.post('/:id/deactivate', checkPermission('update:policies'), async (req, res) => {
  try {
    const policy = await Policy.findByPk(req.params.id);

    if (!policy) {
      return res.status(404).json({ error: 'Policy not found' });
    }

    // Update policy status
    await policy.update({ isActive: false });

    // Audit log
    await createAuditLog({
      action: 'policy_deactivated',
      resourceType: 'policy',
      resourceId: policy.id.toString(),
      details: {
        policyName: policy.name
      },
      userId: req.user.id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json(policy);
  } catch (error) {
    logger.error('Error deactivating policy:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
