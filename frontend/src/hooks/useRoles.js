import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/api';
import { usePagingQueryRequest } from '../components/common/usePagingQueryRequest';

export const useRolePage = ({ orgId = '-1' }) => {
  // 集成分页查询请求
  const { queryRequest, handleQuickSearch, setQueryRequest, resetQueryRequest, handlePageChange } =
    usePagingQueryRequest({
      page: 0,
      size: 20,
      searchKeyword: '',
      sort: 'name,asc'
    });

  // Get all roles with pagination and filters
  const {
    data: rolesData = { content: [], totalElements: 0, totalPages: 0 },
    isLoading,
    isFetching,
    isRefetching,
    error: rolesError,
    refetch: getRoles
  } = useQuery({
    queryKey: ['useRolePage', queryRequest],
    queryFn: async () => {
      const response = await api.get(
        `/api/organizations/${orgId}/roles`,
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
    isLoadingRoles: isLoading || isFetching || isRefetching,
    roles: rolesData,
    rolesError,
    getRoles,
  };
};

export const useRoles = ({ orgId = '-1' }) => {
  const queryClient = useQueryClient();

  // Get role by ID query
  const useRoleById = (roleId) => useQuery({
    queryKey: ['useRoleById', roleId],
    queryFn: async () => {
      const response = await api.get(
        `/api/organizations/${orgId}/roles/${roleId}`
      );
      return response.data;
    },
    enabled: !!roleId
  });

  // Create role mutation
  const createRoleMutation = useMutation({
    mutationFn: async (roleData) => {
      const response = await api.post(
        `/api/organizations/${orgId}/roles`,
        roleData
      );
      return response.data;
    },
    onSuccess: () => {
    }
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ roleId, roleData }) => {
      const response = await api.put(
        `/api/organizations/${orgId}/roles/${roleId}`,
        roleData
      );
      return response.data;
    },
    onSuccess: (updatedRole) => {
    }
  });

  // Delete role mutation
  const deleteRoleMutation = useMutation({
    mutationFn: async (orgId, roleId) => {
      await api.delete(`/api/organizations/${orgId}/roles/${roleId}`);
      return roleId;
    },
    onSuccess: (deletedRoleId) => {
    }
  });

  // Get role permissions query
  const useRolePermissions = (roleId) => useQuery({
    queryKey: ['useRolePermissions', roleId],
    queryFn: async () => {
      const response = await api.get(
        `/api/organizations/${orgId}/roles/${roleId}/permissions`
      );
      return response.data;
    },
    enabled: !!roleId && !!orgId
  });

  // Update role permissions mutation
  const updateRolePermissionsMutation = useMutation({
    mutationFn: async ({ roleId, permissions }) => {
      const response = await api.put(
        `/api/organizations/${orgId}/roles/${roleId}/permissions`,
        permissions
      );
      return response.data;
    },
    onSuccess: (data) => {
    }
  });

  return {
    // Queries
    useRoleById,
    useRolePermissions,

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

    updateRolePermissions: updateRolePermissionsMutation.mutate,
    isUpdatingPermissions: updateRolePermissionsMutation.isPending,
    updatePermissionsError: updateRolePermissionsMutation.error
  };
};
