import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/api';
import { usePagingQueryRequest } from '../components/common/usePagingQueryRequest';

export const useUserPage = ({ orgId = '-1' }) => {
  // 集成分页查询请求
  const { queryRequest, handleQuickSearch, setQueryRequest, resetQueryRequest, handlePageChange } =
    usePagingQueryRequest({
      page: 0,
      size: 20,
      searchKeyword: '',
      sort: 'username,asc'
    });

  // Get all users with pagination and filters
  const {
    data: usersData = { content: [], totalElements: 0, totalPages: 0 },
    isLoading,
    isFetching,
    isRefetching,
    error: usersError,
    refetch: getUsers
  } = useQuery({
    queryKey: ['useUserPage', queryRequest],
    queryFn: async () => {
      const response = await api.get(
        `/api/organizations/${orgId}/users`,
        {
          params: {
            organizationId: orgId,
            ...queryRequest
          }
        }
      );
      return response.data;
    },
    enabled: !!orgId
  });

  return {
    // 分页查询相关
    queryRequest,
    handleQuickSearch,
    setQueryRequest,
    resetQueryRequest,
    handlePageChange,

    // Queries
    isLoadingUsers: isLoading || isFetching || isRefetching,
    users: usersData,
    usersError,
    getUsers,
  };
};

export const useUsers = ({ orgId = '-1' }) => {
  const queryClient = useQueryClient();

  // Get user by ID query
  const useUserById = (userId) => useQuery({
    queryKey: ['useUserById', userId],
    queryFn: async () => {
      const response = await api.get(
        `/api/organizations/${orgId}/users/${userId}`
      );
      return response.data;
    },
    enabled: !!userId && !!orgId
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData) => {
      const response = await api.post(
        `/api/organizations/${orgId}/users`,
        userData
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['useUserPage']);
    }
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, userData }) => {
      const response = await api.put(
        `/api/organizations/${orgId}/users/${userId}`,
        userData
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['useUserPage']);
      queryClient.invalidateQueries(['useUserById']);
    }
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId) => {
      await api.delete(`/api/organizations/${orgId}/users/${userId}`);
      return userId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['useUserPage']);
    }
  });

  // Get user roles query
  const useUserRoles = (userId) => useQuery({
    queryKey: ['useUserRoles', userId],
    queryFn: async () => {
      const response = await api.get(
        `/api/organizations/${orgId}/users/${userId}/roles`
      );
      return response.data;
    },
    enabled: !!userId && !!orgId
  });

  // Assign role mutation
  const assignRoleMutation = useMutation({
    mutationFn: async ({ userId, roleId }) => {
      const response = await api.post(
        `/api/organizations/${orgId}/users/${userId}/roles`,
        { roleId }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['useUserRoles']);
    }
  });

  // Revoke role mutation
  const revokeRoleMutation = useMutation({
    mutationFn: async ({ userId, roleId }) => {
      await api.delete(
        `/api/organizations/${orgId}/users/${userId}/roles/${roleId}`
      );
      return { userId, roleId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['useUserRoles']);
    }
  });

  // Get user teams query
  const useUserTeams = (userId) => useQuery({
    queryKey: ['useUserTeams', userId],
    queryFn: async () => {
      const response = await api.get(
        `/api/organizations/${orgId}/users/${userId}/teams`
      );
      return response.data;
    },
    enabled: !!userId && !!orgId
  });

  // Add to team mutation
  const addToTeamMutation = useMutation({
    mutationFn: async ({ userId, teamId }) => {
      const response = await api.post(
        `/api/organizations/${orgId}/users/${userId}/teams`,
        { teamId }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['useUserTeams']);
    }
  });

  // Remove from team mutation
  const removeFromTeamMutation = useMutation({
    mutationFn: async ({ userId, teamId }) => {
      await api.delete(
        `/api/organizations/${orgId}/users/${userId}/teams/${teamId}`
      );
      return { userId, teamId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['useUserTeams']);
    }
  });

  // Get user activity query
  const useUserActivity = (userId) => useQuery({
    queryKey: ['useUserActivity', userId],
    queryFn: async () => {
      const response = await api.get(
        `/api/organizations/${orgId}/users/${userId}/activity`
      );
      return response.data;
    },
    enabled: !!userId && !!orgId
  });

  // Get user access logs query
  const useUserAccessLogs = (userId) => useQuery({
    queryKey: ['useUserAccessLogs', userId],
    queryFn: async () => {
      const response = await api.get(
        `/api/organizations/${orgId}/users/${userId}/access-logs`
      );
      return response.data;
    },
    enabled: !!userId && !!orgId
  });

  // Get user permissions query
  const useUserPermissions = (userId) => useQuery({
    queryKey: ['useUserPermissions', userId],
    queryFn: async () => {
      const response = await api.get(
        `/api/organizations/${orgId}/users/${userId}/permissions`
      );
      return response.data;
    },
    enabled: !!userId && !!orgId
  });

  // Update user permissions mutation
  const updateUserPermissionsMutation = useMutation({
    mutationFn: async ({ userId, permissions }) => {
      const response = await api.put(
        `/api/organizations/${orgId}/users/${userId}/permissions`,
        permissions
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['useUserPermissions']);
    }
  });

  return {
    // Queries
    useUserById,
    useUserRoles,
    useUserTeams,
    useUserActivity,
    useUserAccessLogs,
    useUserPermissions,

    // Mutations
    createUser: createUserMutation.mutate,
    isCreatingUser: createUserMutation.isPending,
    createUserError: createUserMutation.error,

    updateUser: updateUserMutation.mutate,
    isUpdatingUser: updateUserMutation.isPending,
    updateUserError: updateUserMutation.error,

    deleteUser: deleteUserMutation.mutate,
    isDeletingUser: deleteUserMutation.isPending,
    deleteUserError: deleteUserMutation.error,

    assignRole: assignRoleMutation.mutate,
    isAssigningRole: assignRoleMutation.isPending,
    assignRoleError: assignRoleMutation.error,

    revokeRole: revokeRoleMutation.mutate,
    isRevokingRole: revokeRoleMutation.isPending,
    revokeRoleError: revokeRoleMutation.error,

    addToTeam: addToTeamMutation.mutate,
    isAddingToTeam: addToTeamMutation.isPending,
    addToTeamError: addToTeamMutation.error,

    removeFromTeam: removeFromTeamMutation.mutate,
    isRemovingFromTeam: removeFromTeamMutation.isPending,
    removeFromTeamError: removeFromTeamMutation.error,

    updateUserPermissions: updateUserPermissionsMutation.mutate,
    isUpdatingPermissions: updateUserPermissionsMutation.isPending,
    updatePermissionsError: updateUserPermissionsMutation.error
  };
};
