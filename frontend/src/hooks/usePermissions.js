import { useCallback } from 'react';
import api from '../services/api';

export const usePermissions = () => {
  // const { user } = useAuth();

  const hasPermission = useCallback(async (permissionName, resource = null) => {
    try {
      const response = await api.post('/permissions/check', {
        permissionName,
        resource
      });
      return response.data.hasPermission;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }, []);

  const checkMultiplePermissions = useCallback(async (permissions) => {
    try {
      const response = await api.post('/permissions/check-multiple', {
        permissions
      });
      return response.data.permissions;
    } catch (error) {
      console.error('Error checking multiple permissions:', error);
      return {};
    }
  }, []);

  const getUserPermissions = useCallback(async () => {
    try {
      const response = await api.get('/permissions/user');
      return response.data.permissions;
    } catch (error) {
      console.error('Error getting user permissions:', error);
      return [];
    }
  }, []);

  return {
    hasPermission,
    checkMultiplePermissions,
    getUserPermissions
  };
};
