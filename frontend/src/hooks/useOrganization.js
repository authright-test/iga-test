import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usePagingQueryRequest } from '../components/common/usePagingQueryRequest';
import api from '../api/api';

export const useOrganizationPage = () => {
  // 集成分页查询请求
  const { queryRequest, handleQuickSearch, setQueryRequest, resetQueryRequest, handlePageChange } =
    usePagingQueryRequest({
      page: 0,
      size: 20,
      searchKeyword: '',
      sort: 'name,asc'
    });

  // Get all organizations with pagination and filters
  const {
    data: organizationsData = { content: [], totalElements: 0, totalPages: 0 },
    isLoading,
    isFetching,
    isRefetching,
    error: organizationsError,
    refetch: getOrganizations
  } = useQuery({
    queryKey: ['useOrganizationPage', queryRequest],
    queryFn: async () => {
      const response = await api.get(
        `/api/organizations`,
        {
          params: {
            ...queryRequest
          }
        }
      );
      return response.data;
    },
  });

  return {
    // 分页查询相关
    queryRequest,
    handleQuickSearch,
    setQueryRequest,
    resetQueryRequest,
    handlePageChange,

    // Queries
    isLoadingOrganizations: isLoading || isFetching || isRefetching,
    organizations: organizationsData,
    organizationsError,
    getOrganizations,
  };
};

export const useOrganization = () => {
  const queryClient = useQueryClient();

  // Get organization by ID query
  const useOrganizationById = (organizationId) => useQuery({
    queryKey: ['useOrganizationById', organizationId],
    queryFn: async () => {
      const response = await api.get(
        `/api/organizations/${organizationId}`
      );
      return response.data;
    },
    enabled: !!organizationId
  });

  // Create organization mutation
  const createOrganizationMutation = useMutation({
    mutationFn: async (organizationData) => {
      const response = await api.post(
        `/api/organizations`,
        organizationData
      );
      return response.data;
    },
    onSuccess: () => {

    }
  });

  // Update organization mutation
  const updateOrganizationMutation = useMutation({
    mutationFn: async ({ organizationId, organizationData }) => {
      const response = await api.put(
        `/api/organizations/${organizationId}`,
        organizationData
      );
      return response.data;
    },
    onSuccess: () => {

    }
  });

  // Delete organization mutation
  const deleteOrganizationMutation = useMutation({
    mutationFn: async (organizationId) => {
      await api.delete(`/api/organizations/${organizationId}`);
      return organizationId;
    },
    onSuccess: () => {

    }
  });

  // Get organization members query
  const useOrganizationMembers = (organizationId) => useQuery({
    queryKey: ['useOrganizationMembers', organizationId],
    queryFn: async () => {
      const response = await api.get(
        `/api/organizations/${organizationId}/members`
      );
      return response.data;
    },
    enabled: !!organizationId
  });

  // Update organization members mutation
  const updateOrganizationMembersMutation = useMutation({
    mutationFn: async ({ organizationId, members }) => {
      const response = await api.put(
        `/api/organizations/${organizationId}/members`,
        members
      );
      return response.data;
    },
    onSuccess: () => {

    }
  });

  return {
    // Queries
    useOrganizationById,
    useOrganizationMembers,

    // Mutations
    createOrganization: createOrganizationMutation.mutate,
    isCreatingOrganization: createOrganizationMutation.isPending,
    createOrganizationError: createOrganizationMutation.error,

    updateOrganization: updateOrganizationMutation.mutate,
    isUpdatingOrganization: updateOrganizationMutation.isPending,
    updateOrganizationError: updateOrganizationMutation.error,

    deleteOrganization: deleteOrganizationMutation.mutate,
    isDeletingOrganization: deleteOrganizationMutation.isPending,
    deleteOrganizationError: deleteOrganizationMutation.error,

    updateOrganizationMembers: updateOrganizationMembersMutation.mutate,
    isUpdatingMembers: updateOrganizationMembersMutation.isPending,
    updateMembersError: updateOrganizationMembersMutation.error
  };
};
