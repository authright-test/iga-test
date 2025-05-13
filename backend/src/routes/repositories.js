const express = require('express');
const { 
  getRepositories,
  createRepository,
  updateRepository,
  deleteRepository,
  getRepositoryTeams,
  addTeamToRepository,
  removeTeamFromRepository,
  getRepositoryUsers,
  addUserToRepository,
  removeUserFromRepository,
  getRepositoryPermissions,
  updateRepositoryPermissions,
  getRepositoryBranches,
  getRepositoryCommits,
  syncRepository,
  getRepositoryStats,
  getRepositoryActivity,
  getRepositoryAccessLogs,
  batchCreateRepositories,
  batchUpdateRepositories,
  batchDeleteRepositories,
  advancedSearchRepositories,
  exportRepositories,
  getRepositoriesStatistics,
  getRepositoryProtectedBranches,
  updateRepositoryProtectedBranch,
  getRepositoryWebhooks,
  createRepositoryWebhook,
  getRepositoryDeployKeys,
  addRepositoryDeployKey,
  getRepositoryEnvironments,
  createRepositoryEnvironment,
  getRepositoryLabels,
  createRepositoryLabel,
  getRepositoryMilestones,
  createRepositoryMilestone,
  getRepositoryIssues,
  createRepositoryIssue,
  getRepositoryPullRequests,
  createRepositoryPullRequest,
  getRepositoryComments,
  createRepositoryComment,
  getRepositoryNotifications,
  markRepositoryNotificationsAsRead
} = require('../services/repositoryService');
const { hasPermission } = require('../services/accessControlService');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * Repository Management Routes
 * Handles all repository-related operations including CRUD, team management,
 * access control, and GitHub integration features.
 */

/**
 * @route GET /repositories
 * @desc Get all repositories for an organization
 * @access Private
 * @param {number} organizationId - Organization ID
 * @param {Object} query - Query parameters for filtering and pagination
 */
router.get('/', async (req, res) => {
  try {
    const hasViewPermission = await hasPermission(req.user.id, 'view:repositories');
    
    if (!hasViewPermission) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    
    const organizationId = req.params.organizationId;
    const filters = req.query;
    
    const repositories = await getRepositories(organizationId, filters);
    
    res.json(repositories);
  } catch (error) {
    logger.error('Error getting repositories:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /repositories
 * @desc Create a new repository
 * @access Private
 * @param {number} organizationId - Organization ID
 * @param {Object} repositoryData - Repository creation data
 */
router.post('/', async (req, res) => {
  try {
    const hasCreatePermission = await hasPermission(req.user.id, 'create:repositories');
    
    if (!hasCreatePermission) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    
    const organizationId = req.params.organizationId;
    const repositoryData = req.body;
    
    const repository = await createRepository(organizationId, repositoryData);
    
    res.status(201).json(repository);
  } catch (error) {
    logger.error('Error creating repository:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route PUT /repositories/:id
 * @desc Update an existing repository
 * @access Private
 * @param {number} id - Repository ID
 * @param {Object} updateData - Repository update data
 */
router.put('/:id', async (req, res) => {
  try {
    const hasUpdatePermission = await hasPermission(req.user.id, 'update:repositories');
    
    if (!hasUpdatePermission) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    
    const { organizationId, repoId } = req.params;
    const repositoryData = req.body;
    
    const repository = await updateRepository(organizationId, repoId, repositoryData);
    
    res.json(repository);
  } catch (error) {
    logger.error('Error updating repository:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route DELETE /repositories/:id
 * @desc Delete a repository
 * @access Private
 * @param {number} id - Repository ID
 */
router.delete('/:id', async (req, res) => {
  try {
    const hasDeletePermission = await hasPermission(req.user.id, 'delete:repositories');
    
    if (!hasDeletePermission) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    
    const { organizationId, repoId } = req.params;
    
    await deleteRepository(organizationId, repoId);
    
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting repository:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /repositories/:id/teams
 * @desc Get all teams with access to a repository
 * @access Private
 * @param {number} id - Repository ID
 */
router.get('/:id/teams', async (req, res) => {
  try {
    const hasViewPermission = await hasPermission(req.user.id, 'view:repository_teams');
    
    if (!hasViewPermission) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    
    const { organizationId, repoId } = req.params;
    
    const teams = await getRepositoryTeams(organizationId, repoId);
    
    res.json(teams);
  } catch (error) {
    logger.error('Error getting repository teams:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /repositories/:id/teams
 * @desc Add a team to a repository
 * @access Private
 * @param {number} id - Repository ID
 * @param {Object} teamData - Team access configuration
 */
router.post('/:id/teams', async (req, res) => {
  try {
    const hasManagePermission = await hasPermission(req.user.id, 'manage:repository_teams');
    
    if (!hasManagePermission) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    
    const { organizationId, repoId } = req.params;
    const { teamId } = req.body;
    
    const result = await addTeamToRepository(organizationId, repoId, teamId);
    
    res.json(result);
  } catch (error) {
    logger.error('Error adding team to repository:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route DELETE /repositories/:id/teams/:teamId
 * @desc Remove a team from a repository
 * @access Private
 * @param {number} id - Repository ID
 * @param {number} teamId - Team ID
 */
router.delete('/:id/teams/:teamId', async (req, res) => {
  try {
    const hasManagePermission = await hasPermission(req.user.id, 'manage:repository_teams');
    
    if (!hasManagePermission) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    
    const { organizationId, repoId, teamId } = req.params;
    
    await removeTeamFromRepository(organizationId, repoId, teamId);
    
    res.status(204).send();
  } catch (error) {
    logger.error('Error removing team from repository:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /repositories/:id/users
 * @desc Get all users with access to a repository
 * @access Private
 * @param {number} id - Repository ID
 */
router.get('/:id/users', async (req, res) => {
  try {
    const hasViewPermission = await hasPermission(req.user.id, 'view:repository_users');
    
    if (!hasViewPermission) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    
    const { organizationId, repoId } = req.params;
    
    const users = await getRepositoryUsers(organizationId, repoId);
    
    res.json(users);
  } catch (error) {
    logger.error('Error getting repository users:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /repositories/:id/users
 * @desc Add a user to a repository
 * @access Private
 * @param {number} id - Repository ID
 * @param {Object} userData - User access configuration
 */
router.post('/:id/users', async (req, res) => {
  try {
    const hasManagePermission = await hasPermission(req.user.id, 'manage:repository_users');
    
    if (!hasManagePermission) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    
    const { organizationId, repoId } = req.params;
    const { userId } = req.body;
    
    const result = await addUserToRepository(organizationId, repoId, userId);
    
    res.json(result);
  } catch (error) {
    logger.error('Error adding user to repository:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route DELETE /repositories/:id/users/:userId
 * @desc Remove a user from a repository
 * @access Private
 * @param {number} id - Repository ID
 * @param {number} userId - User ID
 */
router.delete('/:id/users/:userId', async (req, res) => {
  try {
    const hasManagePermission = await hasPermission(req.user.id, 'manage:repository_users');
    
    if (!hasManagePermission) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    
    const { organizationId, repoId, userId } = req.params;
    
    await removeUserFromRepository(organizationId, repoId, userId);
    
    res.status(204).send();
  } catch (error) {
    logger.error('Error removing user from repository:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /repositories/:id/permissions
 * @desc Get repository permission settings
 * @access Private
 * @param {number} id - Repository ID
 */
router.get('/:id/permissions', async (req, res) => {
  try {
    const hasViewPermission = await hasPermission(req.user.id, 'view:repository_permissions');
    
    if (!hasViewPermission) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    
    const { organizationId, repoId } = req.params;
    
    const permissions = await getRepositoryPermissions(organizationId, repoId);
    
    res.json(permissions);
  } catch (error) {
    logger.error('Error getting repository permissions:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route PUT /repositories/:id/permissions
 * @desc Update repository permission settings
 * @access Private
 * @param {number} id - Repository ID
 * @param {Object} permissionData - New permission settings
 */
router.put('/:id/permissions', async (req, res) => {
  try {
    const hasManagePermission = await hasPermission(req.user.id, 'manage:repository_permissions');
    
    if (!hasManagePermission) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    
    const { organizationId, repoId } = req.params;
    const permissions = req.body;
    
    const result = await updateRepositoryPermissions(organizationId, repoId, permissions);
    
    res.json(result);
  } catch (error) {
    logger.error('Error updating repository permissions:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /repositories/:id/branches
 * @desc Get all branches in a repository
 * @access Private
 * @param {number} id - Repository ID
 */
router.get('/:id/branches', async (req, res) => {
  try {
    const hasViewPermission = await hasPermission(req.user.id, 'view:repository_branches');
    
    if (!hasViewPermission) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    
    const { organizationId, repoId } = req.params;
    
    const branches = await getRepositoryBranches(organizationId, repoId);
    
    res.json(branches);
  } catch (error) {
    logger.error('Error getting repository branches:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /repositories/:id/commits
 * @desc Get commit history for a repository
 * @access Private
 * @param {number} id - Repository ID
 * @param {Object} query - Query parameters for filtering commits
 */
router.get('/:id/commits', async (req, res) => {
  try {
    const hasViewPermission = await hasPermission(req.user.id, 'view:repository_commits');
    
    if (!hasViewPermission) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    
    const { organizationId, repoId } = req.params;
    const { branch } = req.query;
    
    const commits = await getRepositoryCommits(organizationId, repoId, branch);
    
    res.json(commits);
  } catch (error) {
    logger.error('Error getting repository commits:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /repositories/:id/sync
 * @desc Synchronize repository data with GitHub
 * @access Private
 * @param {number} id - Repository ID
 */
router.post('/:id/sync', async (req, res) => {
  try {
    const hasManagePermission = await hasPermission(req.user.id, 'manage:repository_sync');
    
    if (!hasManagePermission) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    
    const { organizationId, repoId } = req.params;
    
    const repository = await syncRepository(organizationId, repoId);
    
    res.json(repository);
  } catch (error) {
    logger.error('Error syncing repository:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /repositories/:id/stats
 * @desc Get repository statistics
 * @access Private
 * @param {number} id - Repository ID
 */
router.get('/:id/stats', async (req, res) => {
  try {
    const hasViewPermission = await hasPermission(req.user.id, 'view:repository_stats');
    
    if (!hasViewPermission) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    
    const { organizationId, repoId } = req.params;
    
    const stats = await getRepositoryStats(organizationId, repoId);
    
    res.json(stats);
  } catch (error) {
    logger.error('Error getting repository stats:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /repositories/:id/activity
 * @desc Get repository activity log
 * @access Private
 * @param {number} id - Repository ID
 * @param {Object} query - Query parameters for filtering activity
 */
router.get('/:id/activity', async (req, res) => {
  try {
    const hasViewPermission = await hasPermission(req.user.id, 'view:repository_activity');
    
    if (!hasViewPermission) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    
    const { organizationId, repoId } = req.params;
    
    const activity = await getRepositoryActivity(organizationId, repoId);
    
    res.json(activity);
  } catch (error) {
    logger.error('Error getting repository activity:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /repositories/:id/access-logs
 * @desc Get repository access logs
 * @access Private
 * @param {number} id - Repository ID
 * @param {Object} query - Query parameters for filtering logs
 */
router.get('/:id/access-logs', async (req, res) => {
  try {
    const hasViewPermission = await hasPermission(req.user.id, 'view:repository_access_logs');
    
    if (!hasViewPermission) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    
    const { organizationId, repoId } = req.params;
    
    const logs = await getRepositoryAccessLogs(organizationId, repoId);
    
    res.json(logs);
  } catch (error) {
    logger.error('Error getting repository access logs:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /repositories/batch
 * @desc Batch create multiple repositories
 * @access Private
 * @param {Array} repositories - Array of repository creation data
 */
router.post('/batch', async (req, res) => {
  try {
    const hasCreatePermission = await hasPermission(req.user.id, 'create:repositories');
    
    if (!hasCreatePermission) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    
    const organizationId = req.params.organizationId;
    const repositoriesData = req.body;
    
    const repositories = await batchCreateRepositories(organizationId, repositoriesData);
    
    res.status(201).json(repositories);
  } catch (error) {
    logger.error('Error batch creating repositories:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route PUT /repositories/batch
 * @desc Batch update multiple repositories
 * @access Private
 * @param {Array} updates - Array of repository update data
 */
router.put('/batch', async (req, res) => {
  try {
    const hasUpdatePermission = await hasPermission(req.user.id, 'update:repositories');
    
    if (!hasUpdatePermission) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    
    const organizationId = req.params.organizationId;
    const updates = req.body;
    
    const repositories = await batchUpdateRepositories(organizationId, updates);
    
    res.json(repositories);
  } catch (error) {
    logger.error('Error batch updating repositories:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route DELETE /repositories/batch
 * @desc Batch delete multiple repositories
 * @access Private
 * @param {Array} ids - Array of repository IDs to delete
 */
router.delete('/batch', async (req, res) => {
  try {
    const hasDeletePermission = await hasPermission(req.user.id, 'delete:repositories');
    
    if (!hasDeletePermission) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    
    const organizationId = req.params.organizationId;
    const { repoIds } = req.body;
    
    await batchDeleteRepositories(organizationId, repoIds);
    
    res.status(204).send();
  } catch (error) {
    logger.error('Error batch deleting repositories:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /repositories/search
 * @desc Advanced repository search
 * @access Private
 * @param {Object} query - Search criteria and filters
 */
router.get('/search', async (req, res) => {
  try {
    const hasViewPermission = await hasPermission(req.user.id, 'view:repositories');
    
    if (!hasViewPermission) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    
    const organizationId = req.params.organizationId;
    const searchCriteria = req.query;
    
    const repositories = await advancedSearchRepositories(organizationId, searchCriteria);
    
    res.json(repositories);
  } catch (error) {
    logger.error('Error searching repositories:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /repositories/export
 * @desc Export repository data
 * @access Private
 * @param {Object} query - Export configuration
 */
router.get('/export', async (req, res) => {
  try {
    const hasExportPermission = await hasPermission(req.user.id, 'export:repositories');
    
    if (!hasExportPermission) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    
    const organizationId = req.params.organizationId;
    const exportOptions = req.query;
    
    const exportData = await exportRepositories(organizationId, exportOptions);
    
    res.json(exportData);
  } catch (error) {
    logger.error('Error exporting repositories:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /repositories/statistics
 * @desc Get organization-wide repository statistics
 * @access Private
 * @param {number} organizationId - Organization ID
 */
router.get('/statistics', async (req, res) => {
  try {
    const hasViewPermission = await hasPermission(req.user.id, 'view:repository_statistics');
    
    if (!hasViewPermission) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    
    const organizationId = req.params.organizationId;
    
    const statistics = await getRepositoriesStatistics(organizationId);
    
    res.json(statistics);
  } catch (error) {
    logger.error('Error getting repositories statistics:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /repositories/:id/protected-branches
 * @desc Get protected branch rules
 * @access Private
 * @param {number} id - Repository ID
 */
router.get('/:id/protected-branches', async (req, res) => {
  try {
    const hasViewPermission = await hasPermission(req.user.id, 'view:repository_protection');
    
    if (!hasViewPermission) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    
    const { organizationId, repoId } = req.params;
    
    const branches = await getRepositoryProtectedBranches(organizationId, repoId);
    
    res.json(branches);
  } catch (error) {
    logger.error('Error getting repository protected branches:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route PUT /repositories/:id/protected-branches/:branch
 * @desc Update protected branch rules
 * @access Private
 * @param {number} id - Repository ID
 * @param {string} branch - Branch name
 * @param {Object} protection - Protection rules
 */
router.put('/:id/protected-branches/:branch', async (req, res) => {
  try {
    const hasUpdatePermission = await hasPermission(req.user.id, 'update:repository_protection');
    
    if (!hasUpdatePermission) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    
    const { organizationId, repoId, branch } = req.params;
    const protection = req.body;
    
    const updatedProtection = await updateRepositoryProtectedBranch(organizationId, repoId, branch, protection);
    
    res.json(updatedProtection);
  } catch (error) {
    logger.error('Error updating repository protected branch:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /repositories/:id/webhooks
 * @desc Get repository webhooks
 * @access Private
 * @param {number} id - Repository ID
 */
router.get('/:id/webhooks', async (req, res) => {
  try {
    const hasViewPermission = await hasPermission(req.user.id, 'view:repository_webhooks');
    
    if (!hasViewPermission) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    
    const { organizationId, repoId } = req.params;
    
    const webhooks = await getRepositoryWebhooks(organizationId, repoId);
    
    res.json(webhooks);
  } catch (error) {
    logger.error('Error getting repository webhooks:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /repositories/:id/webhooks
 * @desc Create a new webhook
 * @access Private
 * @param {number} id - Repository ID
 * @param {Object} webhookData - Webhook configuration
 */
router.post('/:id/webhooks', async (req, res) => {
  try {
    const hasCreatePermission = await hasPermission(req.user.id, 'create:repository_webhooks');
    
    if (!hasCreatePermission) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    
    const { organizationId, repoId } = req.params;
    const webhookData = req.body;
    
    const webhook = await createRepositoryWebhook(organizationId, repoId, webhookData);
    
    res.status(201).json(webhook);
  } catch (error) {
    logger.error('Error creating repository webhook:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /repositories/:id/deploy-keys
 * @desc Get repository deploy keys
 * @access Private
 * @param {number} id - Repository ID
 */
router.get('/:id/deploy-keys', async (req, res) => {
  try {
    const hasViewPermission = await hasPermission(req.user.id, 'view:repository_deploy_keys');
    
    if (!hasViewPermission) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    
    const { organizationId, repoId } = req.params;
    
    const keys = await getRepositoryDeployKeys(organizationId, repoId);
    
    res.json(keys);
  } catch (error) {
    logger.error('Error getting repository deploy keys:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /repositories/:id/deploy-keys
 * @desc Add a new deploy key
 * @access Private
 * @param {number} id - Repository ID
 * @param {Object} keyData - Deploy key configuration
 */
router.post('/:id/deploy-keys', async (req, res) => {
  try {
    const hasCreatePermission = await hasPermission(req.user.id, 'create:repository_deploy_keys');
    
    if (!hasCreatePermission) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    
    const { organizationId, repoId } = req.params;
    const keyData = req.body;
    
    const key = await addRepositoryDeployKey(organizationId, repoId, keyData);
    
    res.status(201).json(key);
  } catch (error) {
    logger.error('Error adding repository deploy key:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /repositories/:id/environments
 * @desc Get repository environments
 * @access Private
 * @param {number} id - Repository ID
 */
router.get('/:id/environments', async (req, res) => {
  try {
    const hasViewPermission = await hasPermission(req.user.id, 'view:repository_environments');
    
    if (!hasViewPermission) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    
    const { organizationId, repoId } = req.params;
    
    const environments = await getRepositoryEnvironments(organizationId, repoId);
    
    res.json(environments);
  } catch (error) {
    logger.error('Error getting repository environments:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /repositories/:id/environments
 * @desc Create a new environment
 * @access Private
 * @param {number} id - Repository ID
 * @param {Object} environmentData - Environment configuration
 */
router.post('/:id/environments', async (req, res) => {
  try {
    const hasCreatePermission = await hasPermission(req.user.id, 'create:repository_environments');
    
    if (!hasCreatePermission) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    
    const { organizationId, repoId } = req.params;
    const environmentData = req.body;
    
    const environment = await createRepositoryEnvironment(organizationId, repoId, environmentData);
    
    res.status(201).json(environment);
  } catch (error) {
    logger.error('Error creating repository environment:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /repositories/:id/labels
 * @desc Get repository labels
 * @access Private
 * @param {number} id - Repository ID
 */
router.get('/:id/labels', async (req, res) => {
  try {
    const hasViewPermission = await hasPermission(req.user.id, 'view:repository_labels');
    
    if (!hasViewPermission) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    
    const { organizationId, repoId } = req.params;
    
    const labels = await getRepositoryLabels(organizationId, repoId);
    
    res.json(labels);
  } catch (error) {
    logger.error('Error getting repository labels:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /repositories/:id/labels
 * @desc Create a new label
 * @access Private
 * @param {number} id - Repository ID
 * @param {Object} labelData - Label configuration
 */
router.post('/:id/labels', async (req, res) => {
  try {
    const hasCreatePermission = await hasPermission(req.user.id, 'create:repository_labels');
    
    if (!hasCreatePermission) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    
    const { organizationId, repoId } = req.params;
    const labelData = req.body;
    
    const label = await createRepositoryLabel(organizationId, repoId, labelData);
    
    res.status(201).json(label);
  } catch (error) {
    logger.error('Error creating repository label:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /repositories/:id/milestones
 * @desc Get repository milestones
 * @access Private
 * @param {number} id - Repository ID
 */
router.get('/:id/milestones', async (req, res) => {
  try {
    const hasViewPermission = await hasPermission(req.user.id, 'view:repository_milestones');
    
    if (!hasViewPermission) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    
    const { organizationId, repoId } = req.params;
    
    const milestones = await getRepositoryMilestones(organizationId, repoId);
    
    res.json(milestones);
  } catch (error) {
    logger.error('Error getting repository milestones:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /repositories/:id/milestones
 * @desc Create a new milestone
 * @access Private
 * @param {number} id - Repository ID
 * @param {Object} milestoneData - Milestone configuration
 */
router.post('/:id/milestones', async (req, res) => {
  try {
    const hasCreatePermission = await hasPermission(req.user.id, 'create:repository_milestones');
    
    if (!hasCreatePermission) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    
    const { organizationId, repoId } = req.params;
    const milestoneData = req.body;
    
    const milestone = await createRepositoryMilestone(organizationId, repoId, milestoneData);
    
    res.status(201).json(milestone);
  } catch (error) {
    logger.error('Error creating repository milestone:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /repositories/:id/issues
 * @desc Get repository issues
 * @access Private
 * @param {number} id - Repository ID
 * @param {Object} query - Query parameters for filtering issues
 */
router.get('/:id/issues', async (req, res) => {
  try {
    const hasViewPermission = await hasPermission(req.user.id, 'view:repository_issues');
    
    if (!hasViewPermission) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    
    const { organizationId, repoId } = req.params;
    const filters = req.query;
    
    const issues = await getRepositoryIssues(organizationId, repoId, filters);
    
    res.json(issues);
  } catch (error) {
    logger.error('Error getting repository issues:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /repositories/:id/issues
 * @desc Create a new issue
 * @access Private
 * @param {number} id - Repository ID
 * @param {Object} issueData - Issue configuration
 */
router.post('/:id/issues', async (req, res) => {
  try {
    const hasCreatePermission = await hasPermission(req.user.id, 'create:repository_issues');
    
    if (!hasCreatePermission) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    
    const { organizationId, repoId } = req.params;
    const issueData = req.body;
    
    const issue = await createRepositoryIssue(organizationId, repoId, issueData);
    
    res.status(201).json(issue);
  } catch (error) {
    logger.error('Error creating repository issue:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /repositories/:id/pulls
 * @desc Get repository pull requests
 * @access Private
 * @param {number} id - Repository ID
 * @param {Object} query - Query parameters for filtering pull requests
 */
router.get('/:id/pulls', async (req, res) => {
  try {
    const hasViewPermission = await hasPermission(req.user.id, 'view:repository_pull_requests');
    
    if (!hasViewPermission) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    
    const { organizationId, repoId } = req.params;
    const filters = req.query;
    
    const pullRequests = await getRepositoryPullRequests(organizationId, repoId, filters);
    
    res.json(pullRequests);
  } catch (error) {
    logger.error('Error getting repository pull requests:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /repositories/:id/pulls
 * @desc Create a new pull request
 * @access Private
 * @param {number} id - Repository ID
 * @param {Object} prData - Pull request configuration
 */
router.post('/:id/pulls', async (req, res) => {
  try {
    const hasCreatePermission = await hasPermission(req.user.id, 'create:repository_pull_requests');
    
    if (!hasCreatePermission) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    
    const { organizationId, repoId } = req.params;
    const prData = req.body;
    
    const pullRequest = await createRepositoryPullRequest(organizationId, repoId, prData);
    
    res.status(201).json(pullRequest);
  } catch (error) {
    logger.error('Error creating repository pull request:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /repositories/:id/comments
 * @desc Get repository comments
 * @access Private
 * @param {number} id - Repository ID
 * @param {string} type - Comment type (issue/pull)
 * @param {number} number - Issue/PR number
 */
router.get('/:id/comments', async (req, res) => {
  try {
    const hasViewPermission = await hasPermission(req.user.id, 'view:repository_comments');
    
    if (!hasViewPermission) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    
    const { organizationId, repoId } = req.params;
    const { type, number } = req.query;
    
    const comments = await getRepositoryComments(organizationId, repoId, type, number);
    
    res.json(comments);
  } catch (error) {
    logger.error('Error getting repository comments:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /repositories/:id/comments
 * @desc Create a new comment
 * @access Private
 * @param {number} id - Repository ID
 * @param {string} type - Comment type (issue/pull)
 * @param {number} number - Issue/PR number
 * @param {Object} commentData - Comment content
 */
router.post('/:id/comments', async (req, res) => {
  try {
    const hasCreatePermission = await hasPermission(req.user.id, 'create:repository_comments');
    
    if (!hasCreatePermission) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    
    const { organizationId, repoId } = req.params;
    const { type, number } = req.query;
    const commentData = req.body;
    
    const comment = await createRepositoryComment(organizationId, repoId, type, number, commentData);
    
    res.status(201).json(comment);
  } catch (error) {
    logger.error('Error creating repository comment:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /repositories/:id/notifications
 * @desc Get repository notifications
 * @access Private
 * @param {number} id - Repository ID
 */
router.get('/:id/notifications', async (req, res) => {
  try {
    const hasViewPermission = await hasPermission(req.user.id, 'view:repository_notifications');
    
    if (!hasViewPermission) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    
    const { organizationId, repoId } = req.params;
    
    const notifications = await getRepositoryNotifications(organizationId, repoId);
    
    res.json(notifications);
  } catch (error) {
    logger.error('Error getting repository notifications:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route PUT /repositories/:id/notifications/read
 * @desc Mark notifications as read
 * @access Private
 * @param {number} id - Repository ID
 * @param {string} lastReadAt - Timestamp of last read notification
 */
router.put('/:id/notifications/read', async (req, res) => {
  try {
    const hasUpdatePermission = await hasPermission(req.user.id, 'update:repository_notifications');
    
    if (!hasUpdatePermission) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    
    const { organizationId, repoId } = req.params;
    const { lastReadAt } = req.body;
    
    await markRepositoryNotificationsAsRead(organizationId, repoId, lastReadAt);
    
    res.status(204).send();
  } catch (error) {
    logger.error('Error marking repository notifications as read:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 