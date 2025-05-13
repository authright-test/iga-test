import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const useRoles = () => {
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { organization } = useAuth();

  const fetchRoles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.get(
        `/organizations/${organization.id}/roles`
      );
      
      setRoles(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const createRole = async (roleData) => {
    try {
      const response = await api.post(
        `/organizations/${organization.id}/roles`,
        roleData
      );
      setRoles([...roles, response.data]);
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const updateRole = async (roleId, roleData) => {
    try {
      const response = await api.put(
        `/organizations/${organization.id}/roles/${roleId}`,
        roleData
      );
      setRoles(roles.map(role => 
        role.id === roleId ? response.data : role
      ));
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const deleteRole = async (roleId) => {
    try {
      await api.delete(
        `/organizations/${organization.id}/roles/${roleId}`
      );
      setRoles(roles.filter(role => role.id !== roleId));
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const assignRole = async (roleId, userId) => {
    try {
      const response = await api.post(
        `/organizations/${organization.id}/roles/${roleId}/assign`,
        { userId }
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const revokeRole = async (roleId, userId) => {
    try {
      const response = await api.delete(
        `/organizations/${organization.id}/roles/${roleId}/assign/${userId}`
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const getRolePermissions = async (roleId) => {
    try {
      const response = await api.get(
        `/organizations/${organization.id}/roles/${roleId}/permissions`
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const updateRolePermissions = async (roleId, permissions) => {
    try {
      const response = await api.put(
        `/organizations/${organization.id}/roles/${roleId}/permissions`,
        permissions
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  useEffect(() => {
    if (organization?.id) {
      fetchRoles();
    }
  }, [organization?.id]);

  return {
    roles,
    isLoading,
    error,
    createRole,
    updateRole,
    deleteRole,
    assignRole,
    revokeRole,
    getRolePermissions,
    updateRolePermissions,
    refreshRoles: fetchRoles,
  };
}; 