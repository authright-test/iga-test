import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Main hook for repository management
 * Provides basic CRUD operations and state management for repositories
 */
export const useRepositories = () => {
  const [repositories, setRepositories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { organization } = useAuth();

  const fetchRepositories = async (filters = {}) => {
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
      fetchRepositories();
    }
  }, [organization?.id]);

  return {
    repositories,
    isLoading,
    error,
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
    refreshRepositories: fetchRepositories,
  };
};

/**
 * Hook for batch creating multiple repositories at once
 * Useful for bulk repository setup or migration
 */
export const useBatchCreateRepositories = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ organizationId, repositoriesData }) => {
      const { data } = await api.post(`/organizations/${organizationId}/repositories/batch`, repositoriesData);
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['repositories', variables.organizationId]);
    }
  });
};

/**
 * Hook for batch updating multiple repositories
 * Useful for bulk repository configuration changes
 */
export const useBatchUpdateRepositories = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ organizationId, updates }) => {
      const { data } = await api.put(`/organizations/${organizationId}/repositories/batch`, updates);
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['repositories', variables.organizationId]);
    }
  });
};

/**
 * Hook for batch deleting multiple repositories
 * Useful for bulk repository cleanup
 */
export const useBatchDeleteRepositories = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ organizationId, repoIds }) => {
      await api.delete(`/organizations/${organizationId}/repositories/batch`, { data: { repoIds } });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['repositories', variables.organizationId]);
    }
  });
};

/**
 * Hook for advanced repository search with multiple criteria
 * Supports filtering, sorting, and pagination
 */
export const useAdvancedSearchRepositories = (organizationId, searchCriteria) => {
  return useQuery({
    queryKey: ['repositories', organizationId, 'search', searchCriteria],
    queryFn: async () => {
      const { data } = await api.get(`/organizations/${organizationId}/repositories/search`, {
        params: searchCriteria
      });
      return data;
    },
    enabled: !!organizationId
  });
};

/**
 * Hook for exporting repository data
 * Supports various export formats and data selection
 */
export const useExportRepositories = () => {
  return useMutation({
    mutationFn: async ({ organizationId, exportOptions }) => {
      const { data } = await api.get(`/organizations/${organizationId}/repositories/export`, {
        params: exportOptions,
        responseType: 'blob'
      });
      return data;
    }
  });
};

/**
 * Hook for getting repository statistics
 * Provides insights about repository usage and activity
 */
export const useRepositoriesStatistics = (organizationId) => {
  return useQuery({
    queryKey: ['repositories', organizationId, 'statistics'],
    queryFn: async () => {
      const { data } = await api.get(`/organizations/${organizationId}/repositories/statistics`);
      return data;
    },
    enabled: !!organizationId
  });
};

/**
 * Hook for managing repository branch protection rules
 * Controls who can push to protected branches and what checks are required
 */
export const useRepositoryProtectedBranches = (organizationId, repoId) => {
  return useQuery({
    queryKey: ['repositories', organizationId, repoId, 'protected-branches'],
    queryFn: async () => {
      const { data } = await api.get(`/organizations/${organizationId}/repositories/${repoId}/protected-branches`);
      return data;
    },
    enabled: !!organizationId && !!repoId
  });
};

/**
 * Hook for updating branch protection rules
 * Configures required status checks, review requirements, and restrictions
 */
export const useUpdateRepositoryProtectedBranch = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ organizationId, repoId, branch, protection }) => {
      const { data } = await api.put(
        `/organizations/${organizationId}/repositories/${repoId}/protected-branches/${branch}`,
        protection
      );
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['repositories', variables.organizationId, variables.repoId, 'protected-branches']);
    }
  });
};

/**
 * Hook for managing repository webhooks
 * Handles integration with external services and automation
 */
export const useRepositoryWebhooks = (organizationId, repoId) => {
  return useQuery({
    queryKey: ['repositories', organizationId, repoId, 'webhooks'],
    queryFn: async () => {
      const { data } = await api.get(`/organizations/${organizationId}/repositories/${repoId}/webhooks`);
      return data;
    },
    enabled: !!organizationId && !!repoId
  });
};

/**
 * Hook for creating new webhooks
 * Sets up event triggers and delivery configurations
 */
export const useCreateRepositoryWebhook = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ organizationId, repoId, webhookData }) => {
      const { data } = await api.post(
        `/organizations/${organizationId}/repositories/${repoId}/webhooks`,
        webhookData
      );
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['repositories', variables.organizationId, variables.repoId, 'webhooks']);
    }
  });
};

/**
 * Hook for managing repository deploy keys
 * Handles SSH keys for deployment automation
 */
export const useRepositoryDeployKeys = (organizationId, repoId) => {
  return useQuery({
    queryKey: ['repositories', organizationId, repoId, 'deploy-keys'],
    queryFn: async () => {
      const { data } = await api.get(`/organizations/${organizationId}/repositories/${repoId}/deploy-keys`);
      return data;
    },
    enabled: !!organizationId && !!repoId
  });
};

/**
 * Hook for adding new deploy keys
 * Configures read/write permissions for deployment automation
 */
export const useAddRepositoryDeployKey = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ organizationId, repoId, keyData }) => {
      const { data } = await api.post(
        `/organizations/${organizationId}/repositories/${repoId}/deploy-keys`,
        keyData
      );
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['repositories', variables.organizationId, variables.repoId, 'deploy-keys']);
    }
  });
};

/**
 * Hook for managing repository environments
 * Handles deployment environments and their protection rules
 */
export const useRepositoryEnvironments = (organizationId, repoId) => {
  return useQuery({
    queryKey: ['repositories', organizationId, repoId, 'environments'],
    queryFn: async () => {
      const { data } = await api.get(`/organizations/${organizationId}/repositories/${repoId}/environments`);
      return data;
    },
    enabled: !!organizationId && !!repoId
  });
};

/**
 * Hook for creating new environments
 * Sets up environment-specific configurations and protection rules
 */
export const useCreateRepositoryEnvironment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ organizationId, repoId, environmentData }) => {
      const { data } = await api.post(
        `/organizations/${organizationId}/repositories/${repoId}/environments`,
        environmentData
      );
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['repositories', variables.organizationId, variables.repoId, 'environments']);
    }
  });
};

/**
 * Hook for managing repository labels
 * Handles issue and pull request categorization
 */
export const useRepositoryLabels = (organizationId, repoId) => {
  return useQuery({
    queryKey: ['repositories', organizationId, repoId, 'labels'],
    queryFn: async () => {
      const { data } = await api.get(`/organizations/${organizationId}/repositories/${repoId}/labels`);
      return data;
    },
    enabled: !!organizationId && !!repoId
  });
};

/**
 * Hook for creating new labels
 * Configures label colors and descriptions
 */
export const useCreateRepositoryLabel = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ organizationId, repoId, labelData }) => {
      const { data } = await api.post(
        `/organizations/${organizationId}/repositories/${repoId}/labels`,
        labelData
      );
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['repositories', variables.organizationId, variables.repoId, 'labels']);
    }
  });
};

/**
 * Hook for managing repository milestones
 * Handles project planning and progress tracking
 */
export const useRepositoryMilestones = (organizationId, repoId) => {
  return useQuery({
    queryKey: ['repositories', organizationId, repoId, 'milestones'],
    queryFn: async () => {
      const { data } = await api.get(`/organizations/${organizationId}/repositories/${repoId}/milestones`);
      return data;
    },
    enabled: !!organizationId && !!repoId
  });
};

/**
 * Hook for creating new milestones
 * Sets up milestone deadlines and descriptions
 */
export const useCreateRepositoryMilestone = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ organizationId, repoId, milestoneData }) => {
      const { data } = await api.post(
        `/organizations/${organizationId}/repositories/${repoId}/milestones`,
        milestoneData
      );
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['repositories', variables.organizationId, variables.repoId, 'milestones']);
    }
  });
};

/**
 * Hook for managing repository issues
 * Handles bug tracking and feature requests
 */
export const useRepositoryIssues = (organizationId, repoId, filters = {}) => {
  return useQuery({
    queryKey: ['repositories', organizationId, repoId, 'issues', filters],
    queryFn: async () => {
      const { data } = await api.get(`/organizations/${organizationId}/repositories/${repoId}/issues`, {
        params: filters
      });
      return data;
    },
    enabled: !!organizationId && !!repoId
  });
};

/**
 * Hook for creating new issues
 * Sets up issue details, assignees, and labels
 */
export const useCreateRepositoryIssue = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ organizationId, repoId, issueData }) => {
      const { data } = await api.post(
        `/organizations/${organizationId}/repositories/${repoId}/issues`,
        issueData
      );
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['repositories', variables.organizationId, variables.repoId, 'issues']);
    }
  });
};

/**
 * Hook for managing repository pull requests
 * Handles code review and merging process
 */
export const useRepositoryPullRequests = (organizationId, repoId, filters = {}) => {
  return useQuery({
    queryKey: ['repositories', organizationId, repoId, 'pulls', filters],
    queryFn: async () => {
      const { data } = await api.get(`/organizations/${organizationId}/repositories/${repoId}/pulls`, {
        params: filters
      });
      return data;
    },
    enabled: !!organizationId && !!repoId
  });
};

/**
 * Hook for creating new pull requests
 * Sets up PR details, reviewers, and labels
 */
export const useCreateRepositoryPullRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ organizationId, repoId, prData }) => {
      const { data } = await api.post(
        `/organizations/${organizationId}/repositories/${repoId}/pulls`,
        prData
      );
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['repositories', variables.organizationId, variables.repoId, 'pulls']);
    }
  });
};

/**
 * Hook for managing repository comments
 * Handles discussions on issues and pull requests
 */
export const useRepositoryComments = (organizationId, repoId, type, number) => {
  return useQuery({
    queryKey: ['repositories', organizationId, repoId, 'comments', type, number],
    queryFn: async () => {
      const { data } = await api.get(`/organizations/${organizationId}/repositories/${repoId}/comments`, {
        params: { type, number }
      });
      return data;
    },
    enabled: !!organizationId && !!repoId && !!type && !!number
  });
};

/**
 * Hook for creating new comments
 * Adds feedback to issues and pull requests
 */
export const useCreateRepositoryComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ organizationId, repoId, type, number, commentData }) => {
      const { data } = await api.post(
        `/organizations/${organizationId}/repositories/${repoId}/comments`,
        commentData,
        { params: { type, number } }
      );
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries([
        'repositories',
        variables.organizationId,
        variables.repoId,
        'comments',
        variables.type,
        variables.number
      ]);
    }
  });
};

/**
 * Hook for managing repository notifications
 * Handles user notifications for repository events
 */
export const useRepositoryNotifications = (organizationId, repoId) => {
  return useQuery({
    queryKey: ['repositories', organizationId, repoId, 'notifications'],
    queryFn: async () => {
      const { data } = await api.get(`/organizations/${organizationId}/repositories/${repoId}/notifications`);
      return data;
    },
    enabled: !!organizationId && !!repoId
  });
};

/**
 * Hook for marking notifications as read
 * Updates notification status for better user experience
 */
export const useMarkRepositoryNotificationsAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ organizationId, repoId, lastReadAt }) => {
      await api.put(
        `/organizations/${organizationId}/repositories/${repoId}/notifications/read`,
        { lastReadAt }
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['repositories', variables.organizationId, variables.repoId, 'notifications']);
    }
  });
}; 