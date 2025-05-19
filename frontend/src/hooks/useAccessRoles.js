import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import api from '../api/api';

export const useAccessRoles = () => {
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { organization } = useAuth();

  const fetchRoles = async (filters = {}) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get(
        `/organizations/${organization.id}/access-roles`,
        { params: filters }
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
        `/organizations/${organization.id}/access-roles`,
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
        `/organizations/${organization.id}/access-roles/${roleId}`,
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
        `/organizations/${organization.id}/access-roles/${roleId}`
      );
      setRoles(roles.filter(role => role.id !== roleId));
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const getRoleDetails = async (roleId) => {
    try {
      const response = await api.get(
        `/organizations/${organization.id}/access-roles/${roleId}`
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const getRoleMembers = async (roleId) => {
    try {
      const response = await api.get(
        `/organizations/${organization.id}/access-roles/${roleId}/members`
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const addRoleMember = async (roleId, memberData) => {
    try {
      const response = await api.post(
        `/organizations/${organization.id}/access-roles/${roleId}/members`,
        memberData
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const removeRoleMember = async (roleId, memberId) => {
    try {
      await api.delete(
        `/organizations/${organization.id}/access-roles/${roleId}/members/${memberId}`
      );
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const getRolePermissions = async (roleId) => {
    try {
      const response = await api.get(
        `/organizations/${organization.id}/access-roles/${roleId}/permissions`
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const updateRolePermissions = async (roleId, permissions) => {
    try {
      const response = await api.put(
        `/organizations/${organization.id}/access-roles/${roleId}/permissions`,
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
    getRoleDetails,
    getRoleMembers,
    addRoleMember,
    removeRoleMember,
    getRolePermissions,
    updateRolePermissions,
    refreshRoles: fetchRoles,
  };
};
