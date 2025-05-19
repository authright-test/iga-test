import { Organization, User, Team, Role, Repository } from '../models/index.js';
import { createAuditLog } from './auditService.js';
import logger from '../utils/logger.js';
import { Op } from 'sequelize';
import { Octokit } from '@octokit/rest';

/**
 * Get all organizations with pagination, search and sorting
 */
export const getOrganizations = async ({ page, size, searchKeyword, sort }) => {
  try {
    const [sortField, sortOrder] = sort.split(',');
    const offset = page * size;

    const where = searchKeyword ? {
      [Op.or]: [
        { name: { [Op.iLike]: `%${searchKeyword}%` } },
        { login: { [Op.iLike]: `%${searchKeyword}%` } },
        { email: { [Op.iLike]: `%${searchKeyword}%` } }
      ]
    } : {};

    const { count, rows } = await Organization.findAndCountAll({
      where,
      limit: size,
      offset,
      order: [[sortField, sortOrder.toUpperCase()]],
      include: [
        {
          model: User,
          as: 'members',
          attributes: ['id', 'username', 'email', 'githubLogin']
        },
        {
          model: Repository,
          as: 'repositories',
          attributes: ['id', 'name', 'private']
        }
      ]
    });

    return {
      content: rows,
      totalElements: count,
      totalPages: Math.ceil(count / size),
      page,
      size
    };
  } catch (error) {
    logger.error('Error in getOrganizations:', error);
    throw error;
  }
};

/**
 * Get organization by ID
 */
export const getOrganization = async (id) => {
  try {
    const organization = await Organization.findByPk(id, {
      include: [
        {
          model: User,
          as: 'members',
          attributes: ['id', 'username', 'email', 'githubLogin', 'status'],
          include: [
            {
              model: Role,
              as: 'roles',
              attributes: ['id', 'name']
            }
          ]
        },
        {
          model: Team,
          as: 'teams',
          attributes: ['id', 'name', 'description', 'slug'],
          include: [
            {
              model: User,
              as: 'members',
              attributes: ['id', 'username', 'email', 'githubLogin']
            }
          ]
        },
        {
          model: Repository,
          as: 'repositories',
          attributes: ['id', 'name', 'private', 'description']
        }
      ]
    });

    if (!organization) {
      throw new Error('Organization not found');
    }

    return organization;
  } catch (error) {
    logger.error('Error in getOrganization:', error);
    throw error;
  }
};

/**
 * Create a new organization
 */
export const createOrganization = async (organizationData, userId) => {
  try {
    // 验证必填字段
    const requiredFields = ['name', 'login', 'githubId', 'installationId'];
    for (const field of requiredFields) {
      if (!organizationData[field]) {
        throw new Error(`${field} is required`);
      }
    }

    const organization = await Organization.create(organizationData);

    // Create audit log
    await createAuditLog({
      userId,
      action: 'create',
      resourceType: 'organization',
      resourceId: organization.id,
      details: { 
        name: organization.name,
        login: organization.login,
        githubId: organization.githubId
      }
    });

    return organization;
  } catch (error) {
    logger.error('Error in createOrganization:', error);
    throw error;
  }
};

/**
 * Update an organization
 */
export const updateOrganization = async (id, organizationData, userId) => {
  try {
    const organization = await Organization.findByPk(id);

    if (!organization) {
      throw new Error('Organization not found');
    }

    // 不允许修改的关键字段
    const protectedFields = ['githubId', 'login', 'installationId'];
    for (const field of protectedFields) {
      if (organizationData[field]) {
        delete organizationData[field];
      }
    }

    // Store old data for audit log
    const oldData = { ...organization.toJSON() };

    // Update organization
    await organization.update(organizationData);

    // Create audit log
    await createAuditLog({
      userId,
      action: 'update',
      resourceType: 'organization',
      resourceId: organization.id,
      details: {
        oldData,
        newData: organizationData
      }
    });

    return organization;
  } catch (error) {
    logger.error('Error in updateOrganization:', error);
    throw error;
  }
};

/**
 * Delete an organization
 */
export const deleteOrganization = async (id, userId) => {
  try {
    const organization = await Organization.findByPk(id);

    if (!organization) {
      throw new Error('Organization not found');
    }

    // 检查是否有关联数据
    const memberCount = await organization.countMembers();
    const teamCount = await organization.countTeams();
    const repoCount = await organization.countRepositories();

    if (memberCount > 0 || teamCount > 0 || repoCount > 0) {
      throw new Error('Cannot delete organization with existing members, teams, or repositories');
    }

    // Store data for audit log
    const organizationData = { ...organization.toJSON() };

    // Delete organization
    await organization.destroy();

    // Create audit log
    await createAuditLog({
      userId,
      action: 'delete',
      resourceType: 'organization',
      resourceId: id,
      details: organizationData
    });

    return true;
  } catch (error) {
    logger.error('Error in deleteOrganization:', error);
    throw error;
  }
};

/**
 * Get organization members
 */
export const getOrganizationMembers = async (organizationId) => {
  try {
    const organization = await Organization.findByPk(organizationId, {
      include: [
        {
          model: User,
          as: 'members',
          attributes: ['id', 'username', 'email', 'githubLogin', 'status'],
          include: [
            {
              model: Role,
              as: 'roles',
              attributes: ['id', 'name']
            }
          ]
        }
      ]
    });

    if (!organization) {
      throw new Error('Organization not found');
    }

    return organization.members;
  } catch (error) {
    logger.error('Error in getOrganizationMembers:', error);
    throw error;
  }
};

/**
 * Update organization members
 */
export const updateOrganizationMembers = async (organizationId, memberIds, userId) => {
  try {
    const organization = await Organization.findByPk(organizationId);

    if (!organization) {
      throw new Error('Organization not found');
    }

    // Get current members for audit log
    const currentMembers = await organization.getMembers();
    const currentMemberIds = currentMembers.map(member => member.id);

    // Update members
    await organization.setMembers(memberIds);

    // Create audit log
    await createAuditLog({
      userId,
      action: 'update_members',
      resourceType: 'organization',
      resourceId: organizationId,
      details: {
        oldMemberIds: currentMemberIds,
        newMemberIds: memberIds
      }
    });

    return await getOrganizationMembers(organizationId);
  } catch (error) {
    logger.error('Error in updateOrganizationMembers:', error);
    throw error;
  }
};

/**
 * Get organization teams
 */
export const getOrganizationTeams = async (organizationId) => {
  try {
    const organization = await Organization.findByPk(organizationId, {
      include: [
        {
          model: Team,
          as: 'teams',
          attributes: ['id', 'name', 'description', 'slug'],
          include: [
            {
              model: User,
              as: 'members',
              attributes: ['id', 'username', 'email', 'githubLogin']
            }
          ]
        }
      ]
    });

    if (!organization) {
      throw new Error('Organization not found');
    }

    return organization.teams;
  } catch (error) {
    logger.error('Error in getOrganizationTeams:', error);
    throw error;
  }
};

/**
 * Update organization teams
 */
export const updateOrganizationTeams = async (organizationId, teamIds, userId) => {
  try {
    const organization = await Organization.findByPk(organizationId);

    if (!organization) {
      throw new Error('Organization not found');
    }

    // Get current teams for audit log
    const currentTeams = await organization.getTeams();
    const currentTeamIds = currentTeams.map(team => team.id);

    // Update teams
    await organization.setTeams(teamIds);

    // Create audit log
    await createAuditLog({
      userId,
      action: 'update_teams',
      resourceType: 'organization',
      resourceId: organizationId,
      details: {
        oldTeamIds: currentTeamIds,
        newTeamIds: teamIds
      }
    });

    return await getOrganizationTeams(organizationId);
  } catch (error) {
    logger.error('Error in updateOrganizationTeams:', error);
    throw error;
  }
};

/**
 * Sync organization data with GitHub
 */
export const syncOrganizationWithGitHub = async (organizationId, octokit) => {
  try {
    const organization = await Organization.findByPk(organizationId);
    if (!organization) {
      throw new Error('Organization not found');
    }

    // 获取 GitHub 组织信息
    const { data: githubOrg } = await octokit.orgs.get({
      org: organization.login
    });

    // 更新组织信息
    await organization.update({
      name: githubOrg.name,
      description: githubOrg.description,
      avatarUrl: githubOrg.avatar_url,
      website: githubOrg.blog,
      location: githubOrg.location,
      email: githubOrg.email,
      defaultRepositoryPermission: githubOrg.default_repository_permission,
      membersCanCreateRepositories: githubOrg.members_can_create_repositories,
      twoFactorRequirementEnabled: githubOrg.two_factor_requirement_enabled
    });

    return organization;
  } catch (error) {
    logger.error('Error in syncOrganizationWithGitHub:', error);
    throw error;
  }
}; 