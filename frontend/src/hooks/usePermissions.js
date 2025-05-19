import { useCallback } from 'react';
import api from '../api/api';

export const usePermissions = () => {
  // const { user } = useAuth();

  const hasPermission = useCallback(async (permissionName, resource = null) => {
    // FIXME - return true for dev
    return true;
    // try {
    //   const response = await api.post('/api/permissions/check', {
    //     permissionName,
    //     resource
    //   });
    //   return response.data.hasPermission;
    // } catch (error) {
    //   console.error('Error checking permission:', error);
    //   return false;
    // }
  }, []);

  const checkMultiplePermissions = useCallback(async (permissions) => {
    // FIXME - return true for dev
    return permissions.map(item => true);
    // try {
    //   const response = await api.post('/api/permissions/check-multiple', {
    //     permissions
    //   });
    //   return response.data.permissions;
    // } catch (error) {
    //   console.error('Error checking multiple permissions:', error);
    //   return {};
    // }
  }, []);

  const getUserPermissions = useCallback(async () => {
    try {
      const response = await api.get('/api/permissions/user');
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
