import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import api from '../api/api';

export const useAccessPermissions = () => {
  const [permissions, setPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { organization } = useAuth();

  const fetchPermissions = async (filters = {}) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get(
        `/organizations/${organization.id}/access-permissions`,
        { params: filters }
      );

      setPermissions(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const createPermission = async (permissionData) => {
    try {
      const response = await api.post(
        `/organizations/${organization.id}/access-permissions`,
        permissionData
      );
      setPermissions([...permissions, response.data]);
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const updatePermission = async (permissionId, permissionData) => {
    try {
      const response = await api.put(
        `/organizations/${organization.id}/access-permissions/${permissionId}`,
        permissionData
      );
      setPermissions(permissions.map(permission =>
        permission.id === permissionId ? response.data : permission
      ));
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const deletePermission = async (permissionId) => {
    try {
      await api.delete(
        `/organizations/${organization.id}/access-permissions/${permissionId}`
      );
      setPermissions(permissions.filter(permission => permission.id !== permissionId));
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const getPermissionDetails = async (permissionId) => {
    try {
      const response = await api.get(
        `/organizations/${organization.id}/access-permissions/${permissionId}`
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const getPermissionUsers = async (permissionId) => {
    try {
      const response = await api.get(
        `/organizations/${organization.id}/access-permissions/${permissionId}/users`
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const getPermissionRoles = async (permissionId) => {
    try {
      const response = await api.get(
        `/organizations/${organization.id}/access-permissions/${permissionId}/roles`
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const getPermissionGroups = async (permissionId) => {
    try {
      const response = await api.get(
        `/organizations/${organization.id}/access-permissions/${permissionId}/groups`
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const getPermissionResources = async (permissionId) => {
    try {
      const response = await api.get(
        `/organizations/${organization.id}/access-permissions/${permissionId}/resources`
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const getPermissionHistory = async (permissionId) => {
    try {
      const response = await api.get(
        `/organizations/${organization.id}/access-permissions/${permissionId}/history`
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  useEffect(() => {
    if (organization?.id) {
      fetchPermissions();
    }
  }, [organization?.id]);

  return {
    permissions,
    isLoading,
    error,
    createPermission,
    updatePermission,
    deletePermission,
    getPermissionDetails,
    getPermissionUsers,
    getPermissionRoles,
    getPermissionGroups,
    getPermissionResources,
    getPermissionHistory,
    refreshPermissions: fetchPermissions,
  };
};
