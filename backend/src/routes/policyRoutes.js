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
router.get('/organizations/:organizationId/policies', 
  checkPermission('view:policies'), 
  async (req, res) => {
  try {
    const organizationId = req.query.organizationId;
    const policies = await getOrganizationPolicies(organizationId);

    res.json(policies);
  } catch (error) {
    logger.error('Error getting policies:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/policies/:policyId
 * @desc    Get policy by ID
 * @access  Private
 */
router.get('/organizations/:organizationId/policies/:policyId', 
  checkPermission('view:policies'), 
  async (req, res) => {
  try {
    const organizationId = req.params.organizationId;
    const policy = await Policy.findByPk(req.params.policyId, {
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
router.post('/organizations/:organizationId/policies', 
  checkPermission('create:policies'), 
  async (req, res) => {
  try {
    const organizationId = req.params.organizationId;
    const { name, description, conditions, actions, severity, isActive } = req.body;

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
 * @route   PUT /api/policies/:policyId
 * @desc    Update a policy
 * @access  Private
 */
router.put('/organizations/:organizationId/policies/:policyId', 
  checkPermission('update:policies'), 
  async (req, res) => {
  try {
    const organizationId = req.params.organizationId;
    const { name, description, conditions, actions, severity, isActive } = req.body;

    const policy = await updatePolicy(
      req.params.policyId,
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
 * @route   DELETE /api/policies/:policyId
 * @desc    Delete a policy
 * @access  Private
 */
router.delete('/organizations/:organizationId/policies/:policyId', 
  checkPermission('delete:policies'), 
  async (req, res) => {
  try {
    const success = await deletePolicy(req.params.policyId, req.user.id);

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
 * @route   POST /api/policies/:policyId/activate
 * @desc    Activate a policy
 * @access  Private
 */
router.post('/organizations/:organizationId/policies/:policyId/activate', 
  checkPermission('update:policies'), 
  async (req, res) => {
  try {
    const organizationId = req.params.organizationId;
    const policy = await Policy.findByPk(req.params.policyId);

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
 * @route   POST /api/policies/:policyId/deactivate
 * @desc    Deactivate a policy
 * @access  Private
 */
router.post('/organizations/:organizationId/policies/:policyId/deactivate', 
  checkPermission('update:policies'), 
  async (req, res) => {
  try {
    const organizationId = req.params.organizationId;
    const policy = await Policy.findByPk(req.params.policyId);

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
