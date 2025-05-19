import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import api from '../api/api';

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { organization } = useAuth();

  const getUsers = async (filters = {}) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get(
        `/organizations/${organization.id}/users`,
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
        `/organizations/${organization.id}/users`,
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
        `/organizations/${organization.id}/users/${userId}`,
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
        `/organizations/${organization.id}/users/${userId}`
      );
      setUsers(users.filter(user => user.id !== userId));
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const getUserRoles = async (userId) => {
    try {
      const response = await api.get(
        `/organizations/${organization.id}/users/${userId}/roles`
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const assignRole = async (userId, roleId) => {
    try {
      const response = await api.post(
        `/organizations/${organization.id}/users/${userId}/roles`,
        { roleId }
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const revokeRole = async (userId, roleId) => {
    try {
      const response = await api.delete(
        `/organizations/${organization.id}/users/${userId}/roles/${roleId}`
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const getUserTeams = async (userId) => {
    try {
      const response = await api.get(
        `/organizations/${organization.id}/users/${userId}/teams`
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const addToTeam = async (userId, teamId) => {
    try {
      const response = await api.post(
        `/organizations/${organization.id}/users/${userId}/teams`,
        { teamId }
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const removeFromTeam = async (userId, teamId) => {
    try {
      const response = await api.delete(
        `/organizations/${organization.id}/users/${userId}/teams/${teamId}`
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const getUserActivity = async (userId) => {
    try {
      const response = await api.get(
        `/organizations/${organization.id}/users/${userId}/activity`
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const getUserAccessLogs = async (userId) => {
    try {
      const response = await api.get(
        `/organizations/${organization.id}/users/${userId}/access-logs`
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const getUserPermissions = async (userId) => {
    try {
      const response = await api.get(
        `/organizations/${organization.id}/users/${userId}/permissions`
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const updateUserPermissions = async (userId, permissions) => {
    try {
      const response = await api.put(
        `/organizations/${organization.id}/users/${userId}/permissions`,
        permissions
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  useEffect(() => {
    if (organization?.id) {
      getUsers();
    }
  }, [organization?.id]);

  return {
    users,
    isLoading,
    error,
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    getUserRoles,
    assignRole,
    revokeRole,
    getUserTeams,
    addToTeam,
    removeFromTeam,
    getUserActivity,
    getUserAccessLogs,
    getUserPermissions,
    updateUserPermissions,
  };
};
