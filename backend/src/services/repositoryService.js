const { Repository, User, Team, Organization, AuditLog } = require('../models');
const { Octokit } = require('@octokit/rest');
const logger = require('../utils/logger');
const { Op } = require('sequelize');
const sequelize = require('sequelize');

/**
 * Get all repositories for an organization
 * @param {number} organizationId - Organization ID
 * @param {Object} filters - Filter criteria
 * @returns {Array} List of repositories
 */
const getRepositories = async (organizationId, filters = {}) => {
  try {
    const where = {
      organizationId
    };
    
    if (filters.name) {
      where.name = {
        [Op.like]: `%${filters.name}%`
      };
    }
    
    if (filters.visibility) {
      where.visibility = filters.visibility;
    }
    
    const repositories = await Repository.findAll({
      where,
      include: [
        {
          model: Organization,
          attributes: ['id', 'name']
        }
      ],
      order: [['name', 'ASC']]
    });
    
    return repositories;
  } catch (error) {
    logger.error('Error getting repositories:', error);
    throw error;
  }
};

/**
 * Create a new repository
 * @param {number} organizationId - Organization ID
 * @param {Object} repositoryData - Repository data
 * @returns {Object} Created repository
 */
const createRepository = async (organizationId, repositoryData) => {
  try {
    const organization = await Organization.findByPk(organizationId);
    
    if (!organization) {
      throw new Error('Organization not found');
    }
    
    const octokit = new Octokit({
      auth: organization.githubToken
    });
    
    // Create repository in GitHub
    const githubRepo = await octokit.repos.createInOrg({
      org: organization.githubLogin,
      name: repositoryData.name,
      description: repositoryData.description,
      private: repositoryData.visibility === 'private',
      auto_init: true
    });
    
    // Create repository in database
    const repository = await Repository.create({
      organizationId,
      githubId: githubRepo.data.id,
      name: githubRepo.data.name,
      fullName: githubRepo.data.full_name,
      description: githubRepo.data.description,
      visibility: githubRepo.data.private ? 'private' : 'public',
      defaultBranch: githubRepo.data.default_branch,
      url: githubRepo.data.html_url,
      cloneUrl: githubRepo.data.clone_url,
      sshUrl: githubRepo.data.ssh_url
    });
    
    return repository;
  } catch (error) {
    logger.error('Error creating repository:', error);
    throw error;
  }
};

/**
 * Update a repository
 * @param {number} organizationId - Organization ID
 * @param {number} repoId - Repository ID
 * @param {Object} repositoryData - Repository data
 * @returns {Object} Updated repository
 */
const updateRepository = async (organizationId, repoId, repositoryData) => {
  try {
    const repository = await Repository.findOne({
      where: {
        id: repoId,
        organizationId
      }
    });
    
    if (!repository) {
      throw new Error('Repository not found');
    }
    
    const organization = await Organization.findByPk(organizationId);
    
    const octokit = new Octokit({
      auth: organization.githubToken
    });
    
    // Update repository in GitHub
    const githubRepo = await octokit.repos.update({
      owner: organization.githubLogin,
      repo: repository.name,
      name: repositoryData.name,
      description: repositoryData.description,
      private: repositoryData.visibility === 'private'
    });
    
    // Update repository in database
    await repository.update({
      name: githubRepo.data.name,
      fullName: githubRepo.data.full_name,
      description: githubRepo.data.description,
      visibility: githubRepo.data.private ? 'private' : 'public',
      defaultBranch: githubRepo.data.default_branch,
      url: githubRepo.data.html_url,
      cloneUrl: githubRepo.data.clone_url,
      sshUrl: githubRepo.data.ssh_url
    });
    
    return repository;
  } catch (error) {
    logger.error('Error updating repository:', error);
    throw error;
  }
};

/**
 * Delete a repository
 * @param {number} organizationId - Organization ID
 * @param {number} repoId - Repository ID
 */
const deleteRepository = async (organizationId, repoId) => {
  try {
    const repository = await Repository.findOne({
      where: {
        id: repoId,
        organizationId
      }
    });
    
    if (!repository) {
      throw new Error('Repository not found');
    }
    
    const organization = await Organization.findByPk(organizationId);
    
    const octokit = new Octokit({
      auth: organization.githubToken
    });
    
    // Delete repository in GitHub
    await octokit.repos.delete({
      owner: organization.githubLogin,
      repo: repository.name
    });
    
    // Delete repository in database
    await repository.destroy();
  } catch (error) {
    logger.error('Error deleting repository:', error);
    throw error;
  }
};

/**
 * Get teams for a repository
 * @param {number} organizationId - Organization ID
 * @param {number} repoId - Repository ID
 * @returns {Array} List of teams
 */
const getRepositoryTeams = async (organizationId, repoId) => {
  try {
    const repository = await Repository.findOne({
      where: {
        id: repoId,
        organizationId
      },
      include: [
        {
          model: Team,
          through: { attributes: ['permission'] }
        }
      ]
    });
    
    if (!repository) {
      throw new Error('Repository not found');
    }
    
    return repository.Teams;
  } catch (error) {
    logger.error('Error getting repository teams:', error);
    throw error;
  }
};

/**
 * Add a team to a repository
 * @param {number} organizationId - Organization ID
 * @param {number} repoId - Repository ID
 * @param {number} teamId - Team ID
 * @returns {Object} Updated repository
 */
const addTeamToRepository = async (organizationId, repoId, teamId) => {
  try {
    const [repository, team] = await Promise.all([
      Repository.findOne({
        where: {
          id: repoId,
          organizationId
        }
      }),
      Team.findByPk(teamId)
    ]);
    
    if (!repository) {
      throw new Error('Repository not found');
    }
    
    if (!team) {
      throw new Error('Team not found');
    }
    
    const organization = await Organization.findByPk(organizationId);
    
    const octokit = new Octokit({
      auth: organization.githubToken
    });
    
    // Add team to repository in GitHub
    await octokit.teams.addOrUpdateRepoPermissionsInOrg({
      org: organization.githubLogin,
      team_slug: team.slug,
      owner: organization.githubLogin,
      repo: repository.name,
      permission: 'push'
    });
    
    // Add team to repository in database
    await repository.addTeam(team, {
      through: { permission: 'push' }
    });
    
    return repository;
  } catch (error) {
    logger.error('Error adding team to repository:', error);
    throw error;
  }
};

/**
 * Remove a team from a repository
 * @param {number} organizationId - Organization ID
 * @param {number} repoId - Repository ID
 * @param {number} teamId - Team ID
 */
const removeTeamFromRepository = async (organizationId, repoId, teamId) => {
  try {
    const [repository, team] = await Promise.all([
      Repository.findOne({
        where: {
          id: repoId,
          organizationId
        }
      }),
      Team.findByPk(teamId)
    ]);
    
    if (!repository) {
      throw new Error('Repository not found');
    }
    
    if (!team) {
      throw new Error('Team not found');
    }
    
    const organization = await Organization.findByPk(organizationId);
    
    const octokit = new Octokit({
      auth: organization.githubToken
    });
    
    // Remove team from repository in GitHub
    await octokit.teams.removeRepoInOrg({
      org: organization.githubLogin,
      team_slug: team.slug,
      owner: organization.githubLogin,
      repo: repository.name
    });
    
    // Remove team from repository in database
    await repository.removeTeam(team);
  } catch (error) {
    logger.error('Error removing team from repository:', error);
    throw error;
  }
};

/**
 * Get users for a repository
 * @param {number} organizationId - Organization ID
 * @param {number} repoId - Repository ID
 * @returns {Array} List of users
 */
const getRepositoryUsers = async (organizationId, repoId) => {
  try {
    const repository = await Repository.findOne({
      where: {
        id: repoId,
        organizationId
      },
      include: [
        {
          model: User,
          through: { attributes: ['permission'] }
        }
      ]
    });
    
    if (!repository) {
      throw new Error('Repository not found');
    }
    
    return repository.Users;
  } catch (error) {
    logger.error('Error getting repository users:', error);
    throw error;
  }
};

/**
 * Add a user to a repository
 * @param {number} organizationId - Organization ID
 * @param {number} repoId - Repository ID
 * @param {number} userId - User ID
 * @returns {Object} Updated repository
 */
const addUserToRepository = async (organizationId, repoId, userId) => {
  try {
    const [repository, user] = await Promise.all([
      Repository.findOne({
        where: {
          id: repoId,
          organizationId
        }
      }),
      User.findByPk(userId)
    ]);
    
    if (!repository) {
      throw new Error('Repository not found');
    }
    
    if (!user) {
      throw new Error('User not found');
    }
    
    const organization = await Organization.findByPk(organizationId);
    
    const octokit = new Octokit({
      auth: organization.githubToken
    });
    
    // Add user to repository in GitHub
    await octokit.repos.addCollaborator({
      owner: organization.githubLogin,
      repo: repository.name,
      username: user.githubLogin,
      permission: 'push'
    });
    
    // Add user to repository in database
    await repository.addUser(user, {
      through: { permission: 'push' }
    });
    
    return repository;
  } catch (error) {
    logger.error('Error adding user to repository:', error);
    throw error;
  }
};

/**
 * Remove a user from a repository
 * @param {number} organizationId - Organization ID
 * @param {number} repoId - Repository ID
 * @param {number} userId - User ID
 */
const removeUserFromRepository = async (organizationId, repoId, userId) => {
  try {
    const [repository, user] = await Promise.all([
      Repository.findOne({
        where: {
          id: repoId,
          organizationId
        }
      }),
      User.findByPk(userId)
    ]);
    
    if (!repository) {
      throw new Error('Repository not found');
    }
    
    if (!user) {
      throw new Error('User not found');
    }
    
    const organization = await Organization.findByPk(organizationId);
    
    const octokit = new Octokit({
      auth: organization.githubToken
    });
    
    // Remove user from repository in GitHub
    await octokit.repos.removeCollaborator({
      owner: organization.githubLogin,
      repo: repository.name,
      username: user.githubLogin
    });
    
    // Remove user from repository in database
    await repository.removeUser(user);
  } catch (error) {
    logger.error('Error removing user from repository:', error);
    throw error;
  }
};

/**
 * Get repository permissions
 * @param {number} organizationId - Organization ID
 * @param {number} repoId - Repository ID
 * @returns {Object} Repository permissions
 */
const getRepositoryPermissions = async (organizationId, repoId) => {
  try {
    const repository = await Repository.findOne({
      where: {
        id: repoId,
        organizationId
      },
      include: [
        {
          model: User,
          through: { attributes: ['permission'] }
        },
        {
          model: Team,
          through: { attributes: ['permission'] }
        }
      ]
    });
    
    if (!repository) {
      throw new Error('Repository not found');
    }
    
    return {
      users: repository.Users.map(user => ({
        id: user.id,
        username: user.username,
        permission: user.RepositoryUser.permission
      })),
      teams: repository.Teams.map(team => ({
        id: team.id,
        name: team.name,
        permission: team.RepositoryTeam.permission
      }))
    };
  } catch (error) {
    logger.error('Error getting repository permissions:', error);
    throw error;
  }
};

/**
 * Update repository permissions
 * @param {number} organizationId - Organization ID
 * @param {number} repoId - Repository ID
 * @param {Object} permissions - New permissions
 * @returns {Object} Updated repository
 */
const updateRepositoryPermissions = async (organizationId, repoId, permissions) => {
  try {
    const repository = await Repository.findOne({
      where: {
        id: repoId,
        organizationId
      }
    });
    
    if (!repository) {
      throw new Error('Repository not found');
    }
    
    const organization = await Organization.findByPk(organizationId);
    
    const octokit = new Octokit({
      auth: organization.githubToken
    });
    
    // Update user permissions in GitHub
    for (const user of permissions.users) {
      await octokit.repos.addCollaborator({
        owner: organization.githubLogin,
        repo: repository.name,
        username: user.username,
        permission: user.permission
      });
    }
    
    // Update team permissions in GitHub
    for (const team of permissions.teams) {
      await octokit.teams.addOrUpdateRepoPermissionsInOrg({
        org: organization.githubLogin,
        team_slug: team.slug,
        owner: organization.githubLogin,
        repo: repository.name,
        permission: team.permission
      });
    }
    
    // Update permissions in database
    await Promise.all([
      // Update user permissions
      ...permissions.users.map(user =>
        repository.addUser(user.id, {
          through: { permission: user.permission }
        })
      ),
      // Update team permissions
      ...permissions.teams.map(team =>
        repository.addTeam(team.id, {
          through: { permission: team.permission }
        })
      )
    ]);
    
    return repository;
  } catch (error) {
    logger.error('Error updating repository permissions:', error);
    throw error;
  }
};

/**
 * Get repository branches
 * @param {number} organizationId - Organization ID
 * @param {number} repoId - Repository ID
 * @returns {Array} List of branches
 */
const getRepositoryBranches = async (organizationId, repoId) => {
  try {
    const repository = await Repository.findOne({
      where: {
        id: repoId,
        organizationId
      }
    });
    
    if (!repository) {
      throw new Error('Repository not found');
    }
    
    const organization = await Organization.findByPk(organizationId);
    
    const octokit = new Octokit({
      auth: organization.githubToken
    });
    
    // Get branches from GitHub
    const { data: branches } = await octokit.repos.listBranches({
      owner: organization.githubLogin,
      repo: repository.name
    });
    
    return branches;
  } catch (error) {
    logger.error('Error getting repository branches:', error);
    throw error;
  }
};

/**
 * Get repository commits
 * @param {number} organizationId - Organization ID
 * @param {number} repoId - Repository ID
 * @param {string} branch - Branch name
 * @returns {Array} List of commits
 */
const getRepositoryCommits = async (organizationId, repoId, branch) => {
  try {
    const repository = await Repository.findOne({
      where: {
        id: repoId,
        organizationId
      }
    });
    
    if (!repository) {
      throw new Error('Repository not found');
    }
    
    const organization = await Organization.findByPk(organizationId);
    
    const octokit = new Octokit({
      auth: organization.githubToken
    });
    
    // Get commits from GitHub
    const { data: commits } = await octokit.repos.listCommits({
      owner: organization.githubLogin,
      repo: repository.name,
      sha: branch
    });
    
    return commits;
  } catch (error) {
    logger.error('Error getting repository commits:', error);
    throw error;
  }
};

/**
 * Sync repository with GitHub
 * @param {number} organizationId - Organization ID
 * @param {number} repoId - Repository ID
 * @returns {Object} Updated repository
 */
const syncRepository = async (organizationId, repoId) => {
  try {
    const repository = await Repository.findOne({
      where: {
        id: repoId,
        organizationId
      }
    });
    
    if (!repository) {
      throw new Error('Repository not found');
    }
    
    const organization = await Organization.findByPk(organizationId);
    
    const octokit = new Octokit({
      auth: organization.githubToken
    });
    
    // Get repository data from GitHub
    const { data: githubRepo } = await octokit.repos.get({
      owner: organization.githubLogin,
      repo: repository.name
    });
    
    // Update repository in database
    await repository.update({
      name: githubRepo.name,
      fullName: githubRepo.full_name,
      description: githubRepo.description,
      visibility: githubRepo.private ? 'private' : 'public',
      defaultBranch: githubRepo.default_branch,
      url: githubRepo.html_url,
      cloneUrl: githubRepo.clone_url,
      sshUrl: githubRepo.ssh_url
    });
    
    return repository;
  } catch (error) {
    logger.error('Error syncing repository:', error);
    throw error;
  }
};

/**
 * Get repository statistics
 * @param {number} organizationId - Organization ID
 * @param {number} repoId - Repository ID
 * @returns {Object} Repository statistics
 */
const getRepositoryStats = async (organizationId, repoId) => {
  try {
    const repository = await Repository.findOne({
      where: {
        id: repoId,
        organizationId
      }
    });
    
    if (!repository) {
      throw new Error('Repository not found');
    }
    
    const organization = await Organization.findByPk(organizationId);
    
    const octokit = new Octokit({
      auth: organization.githubToken
    });
    
    // Get repository statistics from GitHub
    const [
      { data: contributors },
      { data: languages },
      { data: traffic }
    ] = await Promise.all([
      octokit.repos.listContributors({
        owner: organization.githubLogin,
        repo: repository.name
      }),
      octokit.repos.listLanguages({
        owner: organization.githubLogin,
        repo: repository.name
      }),
      octokit.repos.getViews({
        owner: organization.githubLogin,
        repo: repository.name
      })
    ]);
    
    return {
      contributors: contributors.length,
      languages,
      views: traffic.views,
      uniqueVisitors: traffic.uniques
    };
  } catch (error) {
    logger.error('Error getting repository stats:', error);
    throw error;
  }
};

/**
 * Get repository activity
 * @param {number} organizationId - Organization ID
 * @param {number} repoId - Repository ID
 * @returns {Object} Repository activity
 */
const getRepositoryActivity = async (organizationId, repoId) => {
  try {
    const repository = await Repository.findOne({
      where: {
        id: repoId,
        organizationId
      }
    });
    
    if (!repository) {
      throw new Error('Repository not found');
    }
    
    const organization = await Organization.findByPk(organizationId);
    
    const octokit = new Octokit({
      auth: organization.githubToken
    });
    
    // Get repository activity from GitHub
    const [
      { data: commits },
      { data: issues },
      { data: pullRequests }
    ] = await Promise.all([
      octokit.repos.listCommits({
        owner: organization.githubLogin,
        repo: repository.name
      }),
      octokit.issues.listForRepo({
        owner: organization.githubLogin,
        repo: repository.name,
        state: 'all'
      }),
      octokit.pulls.list({
        owner: organization.githubLogin,
        repo: repository.name,
        state: 'all'
      })
    ]);
    
    return {
      commits: commits.length,
      issues: issues.length,
      pullRequests: pullRequests.length
    };
  } catch (error) {
    logger.error('Error getting repository activity:', error);
    throw error;
  }
};

/**
 * Get repository access logs
 * @param {number} organizationId - Organization ID
 * @param {number} repoId - Repository ID
 * @returns {Array} List of access logs
 */
const getRepositoryAccessLogs = async (organizationId, repoId) => {
  try {
    const repository = await Repository.findOne({
      where: {
        id: repoId,
        organizationId
      }
    });
    
    if (!repository) {
      throw new Error('Repository not found');
    }
    
    // Get access logs from database
    const logs = await AuditLog.findAll({
      where: {
        resourceType: 'repository',
        resourceId: repoId
      },
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'email']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 100
    });
    
    return logs;
  } catch (error) {
    logger.error('Error getting repository access logs:', error);
    throw error;
  }
};

/**
 * Batch create repositories
 * @param {number} organizationId - Organization ID
 * @param {Array} repositoriesData - Array of repository data
 * @returns {Array} Created repositories
 */
const batchCreateRepositories = async (organizationId, repositoriesData) => {
  try {
    const organization = await Organization.findByPk(organizationId);
    
    if (!organization) {
      throw new Error('Organization not found');
    }
    
    const octokit = new Octokit({
      auth: organization.githubToken
    });
    
    const createdRepositories = [];
    
    for (const repoData of repositoriesData) {
      // Create repository in GitHub
      const githubRepo = await octokit.repos.createInOrg({
        org: organization.githubLogin,
        name: repoData.name,
        description: repoData.description,
        private: repoData.visibility === 'private',
        auto_init: true
      });
      
      // Create repository in database
      const repository = await Repository.create({
        organizationId,
        githubId: githubRepo.data.id,
        name: githubRepo.data.name,
        fullName: githubRepo.data.full_name,
        description: githubRepo.data.description,
        visibility: githubRepo.data.private ? 'private' : 'public',
        defaultBranch: githubRepo.data.default_branch,
        url: githubRepo.data.html_url,
        cloneUrl: githubRepo.data.clone_url,
        sshUrl: githubRepo.data.ssh_url
      });
      
      createdRepositories.push(repository);
    }
    
    return createdRepositories;
  } catch (error) {
    logger.error('Error batch creating repositories:', error);
    throw error;
  }
};

/**
 * Batch update repositories
 * @param {number} organizationId - Organization ID
 * @param {Array} updates - Array of repository updates
 * @returns {Array} Updated repositories
 */
const batchUpdateRepositories = async (organizationId, updates) => {
  try {
    const organization = await Organization.findByPk(organizationId);
    
    if (!organization) {
      throw new Error('Organization not found');
    }
    
    const octokit = new Octokit({
      auth: organization.githubToken
    });
    
    const updatedRepositories = [];
    
    for (const update of updates) {
      const repository = await Repository.findOne({
        where: {
          id: update.id,
          organizationId
        }
      });
      
      if (!repository) {
        continue;
      }
      
      // Update repository in GitHub
      const githubRepo = await octokit.repos.update({
        owner: organization.githubLogin,
        repo: repository.name,
        name: update.name,
        description: update.description,
        private: update.visibility === 'private'
      });
      
      // Update repository in database
      await repository.update({
        name: githubRepo.data.name,
        fullName: githubRepo.data.full_name,
        description: githubRepo.data.description,
        visibility: githubRepo.data.private ? 'private' : 'public',
        defaultBranch: githubRepo.data.default_branch,
        url: githubRepo.data.html_url,
        cloneUrl: githubRepo.data.clone_url,
        sshUrl: githubRepo.data.ssh_url
      });
      
      updatedRepositories.push(repository);
    }
    
    return updatedRepositories;
  } catch (error) {
    logger.error('Error batch updating repositories:', error);
    throw error;
  }
};

/**
 * Batch delete repositories
 * @param {number} organizationId - Organization ID
 * @param {Array} repoIds - Array of repository IDs
 */
const batchDeleteRepositories = async (organizationId, repoIds) => {
  try {
    const organization = await Organization.findByPk(organizationId);
    
    if (!organization) {
      throw new Error('Organization not found');
    }
    
    const octokit = new Octokit({
      auth: organization.githubToken
    });
    
    const repositories = await Repository.findAll({
      where: {
        id: {
          [Op.in]: repoIds
        },
        organizationId
      }
    });
    
    for (const repository of repositories) {
      // Delete repository in GitHub
      await octokit.repos.delete({
        owner: organization.githubLogin,
        repo: repository.name
      });
      
      // Delete repository in database
      await repository.destroy();
    }
  } catch (error) {
    logger.error('Error batch deleting repositories:', error);
    throw error;
  }
};

/**
 * Advanced search repositories
 * @param {number} organizationId - Organization ID
 * @param {Object} searchCriteria - Search criteria
 * @returns {Array} List of repositories
 */
const advancedSearchRepositories = async (organizationId, searchCriteria) => {
  try {
    const where = {
      organizationId
    };
    
    // Name search
    if (searchCriteria.name) {
      where.name = {
        [Op.like]: `%${searchCriteria.name}%`
      };
    }
    
    // Visibility filter
    if (searchCriteria.visibility) {
      where.visibility = searchCriteria.visibility;
    }
    
    // Created date range
    if (searchCriteria.createdAfter || searchCriteria.createdBefore) {
      where.createdAt = {};
      if (searchCriteria.createdAfter) {
        where.createdAt[Op.gte] = new Date(searchCriteria.createdAfter);
      }
      if (searchCriteria.createdBefore) {
        where.createdAt[Op.lte] = new Date(searchCriteria.createdBefore);
      }
    }
    
    // Updated date range
    if (searchCriteria.updatedAfter || searchCriteria.updatedBefore) {
      where.updatedAt = {};
      if (searchCriteria.updatedAfter) {
        where.updatedAt[Op.gte] = new Date(searchCriteria.updatedAfter);
      }
      if (searchCriteria.updatedBefore) {
        where.updatedAt[Op.lte] = new Date(searchCriteria.updatedBefore);
      }
    }
    
    // Team filter
    if (searchCriteria.teamId) {
      where['$Teams.id$'] = searchCriteria.teamId;
    }
    
    // User filter
    if (searchCriteria.userId) {
      where['$Users.id$'] = searchCriteria.userId;
    }
    
    const repositories = await Repository.findAll({
      where,
      include: [
        {
          model: Organization,
          attributes: ['id', 'name']
        },
        {
          model: Team,
          attributes: ['id', 'name'],
          through: { attributes: [] }
        },
        {
          model: User,
          attributes: ['id', 'username'],
          through: { attributes: [] }
        }
      ],
      order: searchCriteria.sort ? [[searchCriteria.sort.field, searchCriteria.sort.direction]] : [['name', 'ASC']],
      limit: searchCriteria.limit || 100,
      offset: searchCriteria.offset || 0
    });
    
    return repositories;
  } catch (error) {
    logger.error('Error advanced searching repositories:', error);
    throw error;
  }
};

/**
 * Export repositories data
 * @param {number} organizationId - Organization ID
 * @param {Object} exportOptions - Export options
 * @returns {Object} Export data
 */
const exportRepositories = async (organizationId, exportOptions) => {
  try {
    const repositories = await advancedSearchRepositories(organizationId, exportOptions.searchCriteria);
    
    const exportData = repositories.map(repo => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.fullName,
      description: repo.description,
      visibility: repo.visibility,
      defaultBranch: repo.defaultBranch,
      url: repo.url,
      cloneUrl: repo.cloneUrl,
      sshUrl: repo.sshUrl,
      teams: repo.Teams.map(team => ({
        id: team.id,
        name: team.name
      })),
      users: repo.Users.map(user => ({
        id: user.id,
        username: user.username
      })),
      createdAt: repo.createdAt,
      updatedAt: repo.updatedAt
    }));
    
    return exportData;
  } catch (error) {
    logger.error('Error exporting repositories:', error);
    throw error;
  }
};

/**
 * Get repository statistics
 * @param {number} organizationId - Organization ID
 * @returns {Object} Repository statistics
 */
const getRepositoriesStatistics = async (organizationId) => {
  try {
    const [
      totalRepositories,
      publicRepositories,
      privateRepositories,
      repositoriesByTeam,
      repositoriesByUser,
      repositoriesByVisibility,
      repositoriesByCreationDate
    ] = await Promise.all([
      // Total repositories
      Repository.count({
        where: { organizationId }
      }),
      
      // Public repositories
      Repository.count({
        where: {
          organizationId,
          visibility: 'public'
        }
      }),
      
      // Private repositories
      Repository.count({
        where: {
          organizationId,
          visibility: 'private'
        }
      }),
      
      // Repositories by team
      Repository.findAll({
        where: { organizationId },
        include: [{
          model: Team,
          attributes: ['id', 'name']
        }],
        group: ['Team.id'],
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('Repository.id')), 'count']
        ]
      }),
      
      // Repositories by user
      Repository.findAll({
        where: { organizationId },
        include: [{
          model: User,
          attributes: ['id', 'username']
        }],
        group: ['User.id'],
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('Repository.id')), 'count']
        ]
      }),
      
      // Repositories by visibility
      Repository.findAll({
        where: { organizationId },
        group: ['visibility'],
        attributes: [
          'visibility',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ]
      }),
      
      // Repositories by creation date
      Repository.findAll({
        where: { organizationId },
        attributes: [
          [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
        order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']]
      })
    ]);
    
    return {
      total: totalRepositories,
      public: publicRepositories,
      private: privateRepositories,
      byTeam: repositoriesByTeam,
      byUser: repositoriesByUser,
      byVisibility: repositoriesByVisibility,
      byCreationDate: repositoriesByCreationDate
    };
  } catch (error) {
    logger.error('Error getting repositories statistics:', error);
    throw error;
  }
};

/**
 * Get repository protected branches
 * @param {number} organizationId - Organization ID
 * @param {number} repoId - Repository ID
 * @returns {Array} List of protected branches
 */
const getRepositoryProtectedBranches = async (organizationId, repoId) => {
  try {
    const repository = await Repository.findOne({
      where: {
        id: repoId,
        organizationId
      }
    });
    
    if (!repository) {
      throw new Error('Repository not found');
    }
    
    const organization = await Organization.findByPk(organizationId);
    
    const octokit = new Octokit({
      auth: organization.githubToken
    });
    
    const { data: branches } = await octokit.repos.listProtectedBranches({
      owner: organization.githubLogin,
      repo: repository.name
    });
    
    return branches;
  } catch (error) {
    logger.error('Error getting repository protected branches:', error);
    throw error;
  }
};

/**
 * Update repository protected branch
 * @param {number} organizationId - Organization ID
 * @param {number} repoId - Repository ID
 * @param {string} branch - Branch name
 * @param {Object} protection - Protection settings
 * @returns {Object} Updated protection
 */
const updateRepositoryProtectedBranch = async (organizationId, repoId, branch, protection) => {
  try {
    const repository = await Repository.findOne({
      where: {
        id: repoId,
        organizationId
      }
    });
    
    if (!repository) {
      throw new Error('Repository not found');
    }
    
    const organization = await Organization.findByPk(organizationId);
    
    const octokit = new Octokit({
      auth: organization.githubToken
    });
    
    const { data } = await octokit.repos.updateBranchProtection({
      owner: organization.githubLogin,
      repo: repository.name,
      branch,
      required_status_checks: protection.requiredStatusChecks,
      enforce_admins: protection.enforceAdmins,
      required_pull_request_reviews: protection.requiredPullRequestReviews,
      restrictions: protection.restrictions
    });
    
    return data;
  } catch (error) {
    logger.error('Error updating repository protected branch:', error);
    throw error;
  }
};

/**
 * Get repository webhooks
 * @param {number} organizationId - Organization ID
 * @param {number} repoId - Repository ID
 * @returns {Array} List of webhooks
 */
const getRepositoryWebhooks = async (organizationId, repoId) => {
  try {
    const repository = await Repository.findOne({
      where: {
        id: repoId,
        organizationId
      }
    });
    
    if (!repository) {
      throw new Error('Repository not found');
    }
    
    const organization = await Organization.findByPk(organizationId);
    
    const octokit = new Octokit({
      auth: organization.githubToken
    });
    
    const { data: webhooks } = await octokit.repos.listWebhooks({
      owner: organization.githubLogin,
      repo: repository.name
    });
    
    return webhooks;
  } catch (error) {
    logger.error('Error getting repository webhooks:', error);
    throw error;
  }
};

/**
 * Create repository webhook
 * @param {number} organizationId - Organization ID
 * @param {number} repoId - Repository ID
 * @param {Object} webhookData - Webhook data
 * @returns {Object} Created webhook
 */
const createRepositoryWebhook = async (organizationId, repoId, webhookData) => {
  try {
    const repository = await Repository.findOne({
      where: {
        id: repoId,
        organizationId
      }
    });
    
    if (!repository) {
      throw new Error('Repository not found');
    }
    
    const organization = await Organization.findByPk(organizationId);
    
    const octokit = new Octokit({
      auth: organization.githubToken
    });
    
    const { data: webhook } = await octokit.repos.createWebhook({
      owner: organization.githubLogin,
      repo: repository.name,
      name: webhookData.name,
      config: webhookData.config,
      events: webhookData.events,
      active: webhookData.active
    });
    
    return webhook;
  } catch (error) {
    logger.error('Error creating repository webhook:', error);
    throw error;
  }
};

/**
 * Get repository deploy keys
 * @param {number} organizationId - Organization ID
 * @param {number} repoId - Repository ID
 * @returns {Array} List of deploy keys
 */
const getRepositoryDeployKeys = async (organizationId, repoId) => {
  try {
    const repository = await Repository.findOne({
      where: {
        id: repoId,
        organizationId
      }
    });
    
    if (!repository) {
      throw new Error('Repository not found');
    }
    
    const organization = await Organization.findByPk(organizationId);
    
    const octokit = new Octokit({
      auth: organization.githubToken
    });
    
    const { data: keys } = await octokit.repos.listDeployKeys({
      owner: organization.githubLogin,
      repo: repository.name
    });
    
    return keys;
  } catch (error) {
    logger.error('Error getting repository deploy keys:', error);
    throw error;
  }
};

/**
 * Add repository deploy key
 * @param {number} organizationId - Organization ID
 * @param {number} repoId - Repository ID
 * @param {Object} keyData - Deploy key data
 * @returns {Object} Added deploy key
 */
const addRepositoryDeployKey = async (organizationId, repoId, keyData) => {
  try {
    const repository = await Repository.findOne({
      where: {
        id: repoId,
        organizationId
      }
    });
    
    if (!repository) {
      throw new Error('Repository not found');
    }
    
    const organization = await Organization.findByPk(organizationId);
    
    const octokit = new Octokit({
      auth: organization.githubToken
    });
    
    const { data: key } = await octokit.repos.createDeployKey({
      owner: organization.githubLogin,
      repo: repository.name,
      title: keyData.title,
      key: keyData.key,
      read_only: keyData.readOnly
    });
    
    return key;
  } catch (error) {
    logger.error('Error adding repository deploy key:', error);
    throw error;
  }
};

/**
 * Get repository environments
 * @param {number} organizationId - Organization ID
 * @param {number} repoId - Repository ID
 * @returns {Array} List of environments
 */
const getRepositoryEnvironments = async (organizationId, repoId) => {
  try {
    const repository = await Repository.findOne({
      where: {
        id: repoId,
        organizationId
      }
    });
    
    if (!repository) {
      throw new Error('Repository not found');
    }
    
    const organization = await Organization.findByPk(organizationId);
    
    const octokit = new Octokit({
      auth: organization.githubToken
    });
    
    const { data: environments } = await octokit.repos.getAllEnvironments({
      owner: organization.githubLogin,
      repo: repository.name
    });
    
    return environments;
  } catch (error) {
    logger.error('Error getting repository environments:', error);
    throw error;
  }
};

/**
 * Create repository environment
 * @param {number} organizationId - Organization ID
 * @param {number} repoId - Repository ID
 * @param {Object} environmentData - Environment data
 * @returns {Object} Created environment
 */
const createRepositoryEnvironment = async (organizationId, repoId, environmentData) => {
  try {
    const repository = await Repository.findOne({
      where: {
        id: repoId,
        organizationId
      }
    });
    
    if (!repository) {
      throw new Error('Repository not found');
    }
    
    const organization = await Organization.findByPk(organizationId);
    
    const octokit = new Octokit({
      auth: organization.githubToken
    });
    
    const { data: environment } = await octokit.repos.createOrUpdateEnvironment({
      owner: organization.githubLogin,
      repo: repository.name,
      environment_name: environmentData.name,
      wait_timer: environmentData.waitTimer,
      reviewers: environmentData.reviewers,
      deployment_branch_policy: environmentData.deploymentBranchPolicy
    });
    
    return environment;
  } catch (error) {
    logger.error('Error creating repository environment:', error);
    throw error;
  }
};

/**
 * Get repository labels
 * @param {number} organizationId - Organization ID
 * @param {number} repoId - Repository ID
 * @returns {Array} List of labels
 */
const getRepositoryLabels = async (organizationId, repoId) => {
  try {
    const repository = await Repository.findOne({
      where: {
        id: repoId,
        organizationId
      }
    });
    
    if (!repository) {
      throw new Error('Repository not found');
    }
    
    const organization = await Organization.findByPk(organizationId);
    
    const octokit = new Octokit({
      auth: organization.githubToken
    });
    
    const { data: labels } = await octokit.issues.listLabelsForRepo({
      owner: organization.githubLogin,
      repo: repository.name
    });
    
    return labels;
  } catch (error) {
    logger.error('Error getting repository labels:', error);
    throw error;
  }
};

/**
 * Create repository label
 * @param {number} organizationId - Organization ID
 * @param {number} repoId - Repository ID
 * @param {Object} labelData - Label data
 * @returns {Object} Created label
 */
const createRepositoryLabel = async (organizationId, repoId, labelData) => {
  try {
    const repository = await Repository.findOne({
      where: {
        id: repoId,
        organizationId
      }
    });
    
    if (!repository) {
      throw new Error('Repository not found');
    }
    
    const organization = await Organization.findByPk(organizationId);
    
    const octokit = new Octokit({
      auth: organization.githubToken
    });
    
    const { data: label } = await octokit.issues.createLabel({
      owner: organization.githubLogin,
      repo: repository.name,
      name: labelData.name,
      color: labelData.color,
      description: labelData.description
    });
    
    return label;
  } catch (error) {
    logger.error('Error creating repository label:', error);
    throw error;
  }
};

/**
 * Get repository milestones
 * @param {number} organizationId - Organization ID
 * @param {number} repoId - Repository ID
 * @returns {Array} List of milestones
 */
const getRepositoryMilestones = async (organizationId, repoId) => {
  try {
    const repository = await Repository.findOne({
      where: {
        id: repoId,
        organizationId
      }
    });
    
    if (!repository) {
      throw new Error('Repository not found');
    }
    
    const organization = await Organization.findByPk(organizationId);
    
    const octokit = new Octokit({
      auth: organization.githubToken
    });
    
    const { data: milestones } = await octokit.issues.listMilestones({
      owner: organization.githubLogin,
      repo: repository.name
    });
    
    return milestones;
  } catch (error) {
    logger.error('Error getting repository milestones:', error);
    throw error;
  }
};

/**
 * Create repository milestone
 * @param {number} organizationId - Organization ID
 * @param {number} repoId - Repository ID
 * @param {Object} milestoneData - Milestone data
 * @returns {Object} Created milestone
 */
const createRepositoryMilestone = async (organizationId, repoId, milestoneData) => {
  try {
    const repository = await Repository.findOne({
      where: {
        id: repoId,
        organizationId
      }
    });
    
    if (!repository) {
      throw new Error('Repository not found');
    }
    
    const organization = await Organization.findByPk(organizationId);
    
    const octokit = new Octokit({
      auth: organization.githubToken
    });
    
    const { data: milestone } = await octokit.issues.createMilestone({
      owner: organization.githubLogin,
      repo: repository.name,
      title: milestoneData.title,
      description: milestoneData.description,
      due_on: milestoneData.dueOn
    });
    
    return milestone;
  } catch (error) {
    logger.error('Error creating repository milestone:', error);
    throw error;
  }
};

/**
 * Get repository issues
 * @param {number} organizationId - Organization ID
 * @param {number} repoId - Repository ID
 * @param {Object} filters - Filter criteria
 * @returns {Array} List of issues
 */
const getRepositoryIssues = async (organizationId, repoId, filters = {}) => {
  try {
    const repository = await Repository.findOne({
      where: {
        id: repoId,
        organizationId
      }
    });
    
    if (!repository) {
      throw new Error('Repository not found');
    }
    
    const organization = await Organization.findByPk(organizationId);
    
    const octokit = new Octokit({
      auth: organization.githubToken
    });
    
    const { data: issues } = await octokit.issues.listForRepo({
      owner: organization.githubLogin,
      repo: repository.name,
      state: filters.state,
      labels: filters.labels,
      sort: filters.sort,
      direction: filters.direction,
      since: filters.since,
      per_page: filters.perPage,
      page: filters.page
    });
    
    return issues;
  } catch (error) {
    logger.error('Error getting repository issues:', error);
    throw error;
  }
};

/**
 * Create repository issue
 * @param {number} organizationId - Organization ID
 * @param {number} repoId - Repository ID
 * @param {Object} issueData - Issue data
 * @returns {Object} Created issue
 */
const createRepositoryIssue = async (organizationId, repoId, issueData) => {
  try {
    const repository = await Repository.findOne({
      where: {
        id: repoId,
        organizationId
      }
    });
    
    if (!repository) {
      throw new Error('Repository not found');
    }
    
    const organization = await Organization.findByPk(organizationId);
    
    const octokit = new Octokit({
      auth: organization.githubToken
    });
    
    const { data: issue } = await octokit.issues.create({
      owner: organization.githubLogin,
      repo: repository.name,
      title: issueData.title,
      body: issueData.body,
      assignees: issueData.assignees,
      labels: issueData.labels,
      milestone: issueData.milestone
    });
    
    return issue;
  } catch (error) {
    logger.error('Error creating repository issue:', error);
    throw error;
  }
};

/**
 * Get repository pull requests
 * @param {number} organizationId - Organization ID
 * @param {number} repoId - Repository ID
 * @param {Object} filters - Filter criteria
 * @returns {Array} List of pull requests
 */
const getRepositoryPullRequests = async (organizationId, repoId, filters = {}) => {
  try {
    const repository = await Repository.findOne({
      where: {
        id: repoId,
        organizationId
      }
    });
    
    if (!repository) {
      throw new Error('Repository not found');
    }
    
    const organization = await Organization.findByPk(organizationId);
    
    const octokit = new Octokit({
      auth: organization.githubToken
    });
    
    const { data: pullRequests } = await octokit.pulls.list({
      owner: organization.githubLogin,
      repo: repository.name,
      state: filters.state,
      head: filters.head,
      base: filters.base,
      sort: filters.sort,
      direction: filters.direction,
      per_page: filters.perPage,
      page: filters.page
    });
    
    return pullRequests;
  } catch (error) {
    logger.error('Error getting repository pull requests:', error);
    throw error;
  }
};

/**
 * Create repository pull request
 * @param {number} organizationId - Organization ID
 * @param {number} repoId - Repository ID
 * @param {Object} prData - Pull request data
 * @returns {Object} Created pull request
 */
const createRepositoryPullRequest = async (organizationId, repoId, prData) => {
  try {
    const repository = await Repository.findOne({
      where: {
        id: repoId,
        organizationId
      }
    });
    
    if (!repository) {
      throw new Error('Repository not found');
    }
    
    const organization = await Organization.findByPk(organizationId);
    
    const octokit = new Octokit({
      auth: organization.githubToken
    });
    
    const { data: pullRequest } = await octokit.pulls.create({
      owner: organization.githubLogin,
      repo: repository.name,
      title: prData.title,
      head: prData.head,
      base: prData.base,
      body: prData.body,
      draft: prData.draft
    });
    
    return pullRequest;
  } catch (error) {
    logger.error('Error creating repository pull request:', error);
    throw error;
  }
};

/**
 * Get repository comments
 * @param {number} organizationId - Organization ID
 * @param {number} repoId - Repository ID
 * @param {string} type - Comment type (issue or pull request)
 * @param {number} number - Issue or pull request number
 * @returns {Array} List of comments
 */
const getRepositoryComments = async (organizationId, repoId, type, number) => {
  try {
    const repository = await Repository.findOne({
      where: {
        id: repoId,
        organizationId
      }
    });
    
    if (!repository) {
      throw new Error('Repository not found');
    }
    
    const organization = await Organization.findByPk(organizationId);
    
    const octokit = new Octokit({
      auth: organization.githubToken
    });
    
    const { data: comments } = await octokit.issues.listComments({
      owner: organization.githubLogin,
      repo: repository.name,
      issue_number: number
    });
    
    return comments;
  } catch (error) {
    logger.error('Error getting repository comments:', error);
    throw error;
  }
};

/**
 * Create repository comment
 * @param {number} organizationId - Organization ID
 * @param {number} repoId - Repository ID
 * @param {string} type - Comment type (issue or pull request)
 * @param {number} number - Issue or pull request number
 * @param {Object} commentData - Comment data
 * @returns {Object} Created comment
 */
const createRepositoryComment = async (organizationId, repoId, type, number, commentData) => {
  try {
    const repository = await Repository.findOne({
      where: {
        id: repoId,
        organizationId
      }
    });
    
    if (!repository) {
      throw new Error('Repository not found');
    }
    
    const organization = await Organization.findByPk(organizationId);
    
    const octokit = new Octokit({
      auth: organization.githubToken
    });
    
    const { data: comment } = await octokit.issues.createComment({
      owner: organization.githubLogin,
      repo: repository.name,
      issue_number: number,
      body: commentData.body
    });
    
    return comment;
  } catch (error) {
    logger.error('Error creating repository comment:', error);
    throw error;
  }
};

/**
 * Get repository notifications
 * @param {number} organizationId - Organization ID
 * @param {number} repoId - Repository ID
 * @returns {Array} List of notifications
 */
const getRepositoryNotifications = async (organizationId, repoId) => {
  try {
    const repository = await Repository.findOne({
      where: {
        id: repoId,
        organizationId
      }
    });
    
    if (!repository) {
      throw new Error('Repository not found');
    }
    
    const organization = await Organization.findByPk(organizationId);
    
    const octokit = new Octokit({
      auth: organization.githubToken
    });
    
    const { data: notifications } = await octokit.activity.listRepoNotifications({
      owner: organization.githubLogin,
      repo: repository.name
    });
    
    return notifications;
  } catch (error) {
    logger.error('Error getting repository notifications:', error);
    throw error;
  }
};

/**
 * Mark repository notifications as read
 * @param {number} organizationId - Organization ID
 * @param {number} repoId - Repository ID
 * @param {string} lastReadAt - Last read timestamp
 */
const markRepositoryNotificationsAsRead = async (organizationId, repoId, lastReadAt) => {
  try {
    const repository = await Repository.findOne({
      where: {
        id: repoId,
        organizationId
      }
    });
    
    if (!repository) {
      throw new Error('Repository not found');
    }
    
    const organization = await Organization.findByPk(organizationId);
    
    const octokit = new Octokit({
      auth: organization.githubToken
    });
    
    await octokit.activity.markRepoNotificationsAsRead({
      owner: organization.githubLogin,
      repo: repository.name,
      last_read_at: lastReadAt
    });
  } catch (error) {
    logger.error('Error marking repository notifications as read:', error);
    throw error;
  }
};

module.exports = {
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
}; 