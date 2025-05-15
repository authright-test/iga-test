import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export const useAccessUsers = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { organization } = useAuth();

  const fetchUsers = async (filters = {}) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get(
        `/organizations/${organization.id}/access-users`,
        { params: filters }
      );

      setUsers(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const createUser = async (userData) => {
    try {
      const response = await api.post(
        `/organizations/${organization.id}/access-users`,
        userData
      );
      setUsers([...users, response.data]);
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const updateUser = async (userId, userData) => {
    try {
      const response = await api.put(
        `/organizations/${organization.id}/access-users/${userId}`,
        userData
      );
      setUsers(users.map(user =>
        user.id === userId ? response.data : user
      ));
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const deleteUser = async (userId) => {
    try {
      await api.delete(
        `/organizations/${organization.id}/access-users/${userId}`
      );
      setUsers(users.filter(user => user.id !== userId));
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const getUserDetails = async (userId) => {
    try {
      const response = await api.get(
        `/organizations/${organization.id}/access-users/${userId}`
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const getUserRoles = async (userId) => {
    try {
      const response = await api.get(
        `/organizations/${organization.id}/access-users/${userId}/roles`
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const assignUserRole = async (userId, roleId) => {
    try {
      const response = await api.post(
        `/organizations/${organization.id}/access-users/${userId}/roles`,
        { roleId }
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const removeUserRole = async (userId, roleId) => {
    try {
      await api.delete(
        `/organizations/${organization.id}/access-users/${userId}/roles/${roleId}`
      );
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const getUserGroups = async (userId) => {
    try {
      const response = await api.get(
        `/organizations/${organization.id}/access-users/${userId}/groups`
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const addUserToGroup = async (userId, groupId) => {
    try {
      const response = await api.post(
        `/organizations/${organization.id}/access-users/${userId}/groups`,
        { groupId }
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const removeUserFromGroup = async (userId, groupId) => {
    try {
      await api.delete(
        `/organizations/${organization.id}/access-users/${userId}/groups/${groupId}`
      );
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const getUserPermissions = async (userId) => {
    try {
      const response = await api.get(
        `/organizations/${organization.id}/access-users/${userId}/permissions`
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const getUserAccessHistory = async (userId) => {
    try {
      const response = await api.get(
        `/organizations/${organization.id}/access-users/${userId}/access-history`
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  useEffect(() => {
    if (organization?.id) {
      fetchUsers();
    }
  }, [organization?.id]);

  return {
    users,
    isLoading,
    error,
    createUser,
    updateUser,
    deleteUser,
    getUserDetails,
    getUserRoles,
    assignUserRole,
    removeUserRole,
    getUserGroups,
    addUserToGroup,
    removeUserFromGroup,
    getUserPermissions,
    getUserAccessHistory,
    refreshUsers: fetchUsers,
  };
};
