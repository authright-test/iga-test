import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import api from '../services/api';

/**
 * Main hook for repository management
 * Provides basic CRUD operations and state management for repositories
 */
export const useRepositories = () => {
  const [repositories, setRepositories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { organization } = useAuth();

  const getRepositories = async (filters = {}) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get(
        `/organizations/${organization.id}/repositories`,
        { params: filters }
      );

      setRepositories(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const createRepository = async (repoData) => {
    try {
      const response = await api.post(
        `/organizations/${organization.id}/repositories`,
        repoData
      );
      setRepositories([...repositories, response.data]);
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const updateRepository = async (repoId, repoData) => {
    try {
      const response = await api.put(
        `/organizations/${organization.id}/repositories/${repoId}`,
        repoData
      );
      setRepositories(repositories.map(repo =>
        repo.id === repoId ? response.data : repo
      ));
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const deleteRepository = async (repoId) => {
    try {
      await api.delete(
        `/organizations/${organization.id}/repositories/${repoId}`
      );
      setRepositories(repositories.filter(repo => repo.id !== repoId));
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const getRepositoryTeams = async (repoId) => {
    try {
      const response = await api.get(
        `/organizations/${organization.id}/repositories/${repoId}/teams`
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const addTeam = async (repoId, teamId) => {
    try {
      const response = await api.post(
        `/organizations/${organization.id}/repositories/${repoId}/teams`,
        { teamId }
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const removeTeam = async (repoId, teamId) => {
    try {
      const response = await api.delete(
        `/organizations/${organization.id}/repositories/${repoId}/teams/${teamId}`
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const getRepositoryUsers = async (repoId) => {
    try {
      const response = await api.get(
        `/organizations/${organization.id}/repositories/${repoId}/users`
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const addUser = async (repoId, userId) => {
    try {
      const response = await api.post(
        `/organizations/${organization.id}/repositories/${repoId}/users`,
        { userId }
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const removeUser = async (repoId, userId) => {
    try {
      const response = await api.delete(
        `/organizations/${organization.id}/repositories/${repoId}/users/${userId}`
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const getRepositoryPermissions = async (repoId) => {
    try {
      const response = await api.get(
        `/organizations/${organization.id}/repositories/${repoId}/permissions`
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const updateRepositoryPermissions = async (repoId, permissions) => {
    try {
      const response = await api.put(
        `/organizations/${organization.id}/repositories/${repoId}/permissions`,
        permissions
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const getRepositoryBranches = async (repoId) => {
    try {
      const response = await api.get(
        `/organizations/${organization.id}/repositories/${repoId}/branches`
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const getRepositoryCommits = async (repoId, branch) => {
    try {
      const response = await api.get(
        `/organizations/${organization.id}/repositories/${repoId}/commits`,
        { params: { branch } }
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const syncRepository = async (repositoryId) => {
    try {
      const response = await api.post(
        `/organizations/${organization.id}/repositories/${repositoryId}/sync`
      );
      setRepositories(repositories.map(repo =>
        repo.id === repositoryId ? response.data : repo
      ));
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const getRepositoryStats = async (repositoryId) => {
    try {
      const response = await api.get(
        `/organizations/${organization.id}/repositories/${repositoryId}/stats`
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const getRepositoryActivity = async (repositoryId) => {
    try {
      const response = await api.get(
        `/organizations/${organization.id}/repositories/${repositoryId}/activity`
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const getRepositoryAccessLogs = async (repositoryId) => {
    try {
      const response = await api.get(
        `/organizations/${organization.id}/repositories/${repositoryId}/access-logs`
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  useEffect(() => {
    if (organization?.id) {
      getRepositories();
    }
  }, [organization?.id]);

  return {
    repositories,
    isLoading,
    error,
    getRepositories,
    createRepository,
    updateRepository,
    deleteRepository,
    getRepositoryTeams,
    addTeam,
    removeTeam,
    getRepositoryUsers,
    addUser,
    removeUser,
    getRepositoryPermissions,
    updateRepositoryPermissions,
    getRepositoryBranches,
    getRepositoryCommits,
    syncRepository,
    getRepositoryStats,
    getRepositoryActivity,
    getRepositoryAccessLogs,
  };
};
