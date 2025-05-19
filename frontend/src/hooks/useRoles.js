import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext.jsx';
import api from '../api/api';

export const useRoles = () => {
  const { organization } = useAuth();
  const queryClient = useQueryClient();

  // Query key factory
  const getQueryKey = (key) => ['roles', organization?.id, key];

  // Get all roles
  const {
    data: roles = {},
    isLoading: isLoadingRoles,
    error: rolesError,
    refetch: getRoles
  } = useQuery({
    queryKey: getQueryKey('list'),
    queryFn: async () => {
      const response = await api.get(`/organizations/${organization.id}/roles`);
      return response.data;
    },
    enabled: !!organization?.id
  });

  // Create role mutation
  const createRoleMutation = useMutation({
    mutationFn: async (roleData) => {
      const response = await api.post(
        `/organizations/${organization.id}/roles`,
        roleData
      );
      return response.data;
    },
    onSuccess: (newRole) => {
      queryClient.setQueryData(getQueryKey('list'), (oldRoles) => [...oldRoles, newRole]);
    }
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ roleId, roleData }) => {
      const response = await api.put(
        `/organizations/${organization.id}/roles/${roleId}`,
        roleData
      );
      return response.data;
    },
    onSuccess: (updatedRole) => {
      queryClient.setQueryData(getQueryKey('list'), (oldRoles) =>
        oldRoles.map(role => role.id === updatedRole.id ? updatedRole : role)
      );
    }
  });

  // Delete role mutation
  const deleteRoleMutation = useMutation({
    mutationFn: async (roleId) => {
      await api.delete(`/organizations/${organization.id}/roles/${roleId}`);
      return roleId;
    },
    onSuccess: (deletedRoleId) => {
      queryClient.setQueryData(getQueryKey('list'), (oldRoles) =>
        oldRoles.filter(role => role.id !== deletedRoleId)
      );
    }
  });

  // Assign role mutation
  const assignRoleMutation = useMutation({
    mutationFn: async ({ roleId, userId }) => {
      const response = await api.post(
        `/organizations/${organization.id}/roles/${roleId}/assign`,
        { userId }
      );
      return response.data;
    }
  });

  // Revoke role mutation
  const revokeRoleMutation = useMutation({
    mutationFn: async ({ roleId, userId }) => {
      const response = await api.delete(
        `/organizations/${organization.id}/roles/${roleId}/assign/${userId}`
      );
      return response.data;
    }
  });

  // Get role permissions query
  const getRolePermissionsQuery = (roleId) => useQuery({
    queryKey: getQueryKey(['permissions', roleId]),
    queryFn: async () => {
      const response = await api.get(
        `/organizations/${organization.id}/roles/${roleId}/permissions`
      );
      return response.data;
    },
    enabled: !!roleId && !!organization?.id
  });

  // Update role permissions mutation
  const updateRolePermissionsMutation = useMutation({
    mutationFn: async ({ roleId, permissions }) => {
      const response = await api.put(
        `/organizations/${organization.id}/roles/${roleId}/permissions`,
        permissions
      );
      return response.data;
    },
    onSuccess: (data, { roleId }) => {
      queryClient.invalidateQueries(getQueryKey(['permissions', roleId]));
    }
  });

  return {
    // Queries
    roles,
    isLoadingRoles,
    rolesError,
    getRoles,
    getRolePermissionsQuery,

    // Mutations
    createRole: createRoleMutation.mutate,
    isCreatingRole: createRoleMutation.isPending,
    createRoleError: createRoleMutation.error,

    updateRole: updateRoleMutation.mutate,
    isUpdatingRole: updateRoleMutation.isPending,
    updateRoleError: updateRoleMutation.error,

    deleteRole: deleteRoleMutation.mutate,
    isDeletingRole: deleteRoleMutation.isPending,
    deleteRoleError: deleteRoleMutation.error,

    assignRole: assignRoleMutation.mutate,
    isAssigningRole: assignRoleMutation.isPending,
    assignRoleError: assignRoleMutation.error,

    revokeRole: revokeRoleMutation.mutate,
    isRevokingRole: revokeRoleMutation.isPending,
    revokeRoleError: revokeRoleMutation.error,

    updateRolePermissions: updateRolePermissionsMutation.mutate,
    isUpdatingPermissions: updateRolePermissionsMutation.isPending,
    updatePermissionsError: updateRolePermissionsMutation.error
  };
};
