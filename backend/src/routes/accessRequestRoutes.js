import express from 'express';
import { Octokit } from '@octokit/rest';
import { createAppAuth } from '@octokit/auth-app';
import { checkPermission } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

// GitHub App Authentication
const auth = createAppAuth({
  appId: process.env.GITHUB_APP_ID,
  privateKey: process.env.GITHUB_APP_PRIVATE_KEY,
  clientId: process.env.GITHUB_APP_CLIENT_ID,
  clientSecret: process.env.GITHUB_APP_CLIENT_SECRET,
});

// Get all access requests
router.get('/', checkPermission('requests.view'), async (req, res) => {
  try {
    const octokit = new Octokit({ auth });
    const { data: requests } = await octokit.issues.listForRepo({
      owner: req.query.organization,
      repo: 'access-requests',
      labels: ['access-request'],
      state: 'all',
    });
    res.json(requests);
  } catch (error) {
    logger.error('Error fetching access requests:', error);
    res.status(500).json({ error: 'Failed to fetch access requests' });
  }
});

// Get single access request
router.get('/:requestId', checkPermission('requests.view'), async (req, res) => {
  try {
    const octokit = new Octokit({ auth });
    const { data: request } = await octokit.issues.get({
      owner: req.query.organization,
      repo: 'access-requests',
      issue_number: req.params.requestId,
    });
    res.json(request);
  } catch (error) {
    logger.error('Error fetching access request:', error);
    res.status(500).json({ error: 'Failed to fetch access request' });
  }
});

// Create access request
router.post('/', checkPermission('requests.create'), async (req, res) => {
  try {
    const octokit = new Octokit({ auth });
    const { data: request } = await octokit.issues.create({
      owner: req.query.organization,
      repo: 'access-requests',
      title: `Access Request: ${req.body.title}`,
      body: `
### Request Details
- **Requested By**: ${req.body.requestedBy}
- **Resource Type**: ${req.body.resourceType}
- **Resource Name**: ${req.body.resourceName}
- **Access Level**: ${req.body.accessLevel}
- **Duration**: ${req.body.duration || 'Permanent'}
- **Reason**: ${req.body.reason}

### Additional Information
${req.body.additionalInfo || 'None'}
      `,
      labels: ['access-request', 'pending'],
    });
    res.status(201).json(request);
  } catch (error) {
    logger.error('Error creating access request:', error);
    res.status(500).json({ error: 'Failed to create access request' });
  }
});

// Update access request status
router.put('/:requestId/status', checkPermission('requests.approve'), async (req, res) => {
  try {
    const octokit = new Octokit({ auth });
    const { data: request } = await octokit.issues.update({
      owner: req.query.organization,
      repo: 'access-requests',
      issue_number: req.params.requestId,
      state: req.body.status === 'approved' ? 'closed' : 'open',
      labels: ['access-request', req.body.status],
    });

    // Add approval comment
    await octokit.issues.createComment({
      owner: req.query.organization,
      repo: 'access-requests',
      issue_number: req.params.requestId,
      body: `
### Access Request ${req.body.status.toUpperCase()}
- **Status**: ${req.body.status}
- **Approved By**: ${req.body.approvedBy}
- **Comments**: ${req.body.comments || 'None'}

${req.body.status === 'approved' ? 'Access has been granted.' : 'Access request has been denied.'}
      `,
    });

    // If approved, execute access grant
    if (req.body.status === 'approved') {
      await grantAccess(req.body);
    }

    res.json(request);
  } catch (error) {
    logger.error('Error updating access request status:', error);
    res.status(500).json({ error: 'Failed to update access request status' });
  }
});

// Add request comment
router.post('/:requestId/comments', checkPermission('requests.comment'), async (req, res) => {
  try {
    const octokit = new Octokit({ auth });
    const { data: comment } = await octokit.issues.createComment({
      owner: req.query.organization,
      repo: 'access-requests',
      issue_number: req.params.requestId,
      body: req.body.comment,
    });
    res.status(201).json(comment);
  } catch (error) {
    logger.error('Error adding request comment:', error);
    res.status(500).json({ error: 'Failed to add request comment' });
  }
});

// Get request statistics
router.get('/stats/summary', checkPermission('requests.view'), async (req, res) => {
  try {
    const octokit = new Octokit({ auth });
    const { data: requests } = await octokit.issues.listForRepo({
      owner: req.query.organization,
      repo: 'access-requests',
      labels: ['access-request'],
      state: 'all',
    });

    const stats = {
      total: requests.length,
      pending: requests.filter(r => r.labels.some(l => l.name === 'pending')).length,
      approved: requests.filter(r => r.labels.some(l => l.name === 'approved')).length,
      denied: requests.filter(r => r.labels.some(l => l.name === 'denied')).length,
      byResourceType: requests.reduce((acc, request) => {
        const resourceType = request.body.match(/Resource Type: (.*)/)?.[1] || 'Unknown';
        acc[resourceType] = (acc[resourceType] || 0) + 1;
        return acc;
      }, {}),
    };

    res.json(stats);
  } catch (error) {
    logger.error('Error fetching request stats:', error);
    res.status(500).json({ error: 'Failed to fetch request stats' });
  }
});

// Get request trends
router.get('/stats/trends', checkPermission('requests.view'), async (req, res) => {
  try {
    const octokit = new Octokit({ auth });
    const { data: requests } = await octokit.issues.listForRepo({
      owner: req.query.organization,
      repo: 'access-requests',
      labels: ['access-request'],
      state: 'all',
    });

    // Group statistics by date
    const trends = requests.reduce((acc, request) => {
      const date = request.created_at.split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          total: 0,
          pending: 0,
          approved: 0,
          denied: 0,
        };
      }
      acc[date].total++;
      if (request.labels.some(l => l.name === 'pending')) {
        acc[date].pending++;
      } else if (request.labels.some(l => l.name === 'approved')) {
        acc[date].approved++;
      } else if (request.labels.some(l => l.name === 'denied')) {
        acc[date].denied++;
      }
      return acc;
    }, {});

    res.json(trends);
  } catch (error) {
    logger.error('Error fetching request trends:', error);
    res.status(500).json({ error: 'Failed to fetch request trends' });
  }
});

// Helper function: Execute access grant
async function grantAccess(requestData) {
  const octokit = new Octokit({ auth });
  const { resourceType, resourceName, accessLevel, requestedBy } = requestData;

  try {
    switch (resourceType) {
      case 'repository':
        await octokit.repos.addCollaborator({
          owner: requestData.organization,
          repo: resourceName,
          username: requestedBy,
          permission: accessLevel,
        });
        break;

      case 'team':
        await octokit.teams.addOrUpdateMembershipForUserInOrg({
          org: requestData.organization,
          team_slug: resourceName,
          username: requestedBy,
          role: accessLevel,
        });
        break;

      case 'organization':
        await octokit.orgs.setMembershipForUser({
          org: requestData.organization,
          username: requestedBy,
          role: accessLevel,
        });
        break;

      default:
        throw new Error(`Unsupported resource type: ${resourceType}`);
    }
  } catch (error) {
    logger.error('Error granting access:', error);
    throw error;
  }
}

export default router;
