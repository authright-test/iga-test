import { Organization, User, Team } from '../models/index.js';
import logger from '../utils/logger.js';

/**
 * Get organization details
 * @param {string} orgName - Organization name
 * @returns {Object} Organization details
 */
const getOrganization = async (orgName) => {
  try {
    const organization = await Organization.findOne({
      where: { githubLogin: orgName },
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'email']
        },
        {
          model: Team,
          attributes: ['id', 'name', 'slug']
        }
      ]
    });

    if (!organization) {
      throw new Error('Organization not found');
    }

    return organization;
  } catch (error) {
    logger.error('Error getting organization:', error);
    throw error;
  }
};

/**
 * Get organization members
 * @param {string} orgName - Organization name
 * @returns {Array} List of organization members
 */
const getOrganizationMembers = async (orgName) => {
  try {
    const organization = await Organization.findOne({
      where: { githubLogin: orgName },
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'email', 'githubLogin']
        }
      ]
    });

    if (!organization) {
      throw new Error('Organization not found');
    }

    return organization.Users;
  } catch (error) {
    logger.error('Error getting organization members:', error);
    throw error;
  }
};

/**
 * Get organization teams
 * @param {string} orgName - Organization name
 * @returns {Array} List of organization teams
 */
const getOrganizationTeams = async (orgName) => {
  try {
    const organization = await Organization.findOne({
      where: { githubLogin: orgName },
      include: [
        {
          model: Team,
          attributes: ['id', 'name', 'slug', 'description'],
          include: [
            {
              model: User,
              attributes: ['id', 'username', 'email']
            }
          ]
        }
      ]
    });

    if (!organization) {
      throw new Error('Organization not found');
    }

    return organization.Teams;
  } catch (error) {
    logger.error('Error getting organization teams:', error);
    throw error;
  }
};

export {
  getOrganization,
  getOrganizationMembers,
  getOrganizationTeams
}; 