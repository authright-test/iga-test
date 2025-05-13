import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const useAccessGroups = () => {
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { organization } = useAuth();

  const fetchGroups = async (filters = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.get(
        `/organizations/${organization.id}/access-groups`,
        { params: filters }
      );
      
      setGroups(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const createGroup = async (groupData) => {
    try {
      const response = await api.post(
        `/organizations/${organization.id}/access-groups`,
        groupData
      );
      setGroups([...groups, response.data]);
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const updateGroup = async (groupId, groupData) => {
    try {
      const response = await api.put(
        `/organizations/${organization.id}/access-groups/${groupId}`,
        groupData
      );
      setGroups(groups.map(group => 
        group.id === groupId ? response.data : group
      ));
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const deleteGroup = async (groupId) => {
    try {
      await api.delete(
        `/organizations/${organization.id}/access-groups/${groupId}`
      );
      setGroups(groups.filter(group => group.id !== groupId));
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const getGroupDetails = async (groupId) => {
    try {
      const response = await api.get(
        `/organizations/${organization.id}/access-groups/${groupId}`
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const getGroupMembers = async (groupId) => {
    try {
      const response = await api.get(
        `/organizations/${organization.id}/access-groups/${groupId}/members`
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const addGroupMember = async (groupId, memberData) => {
    try {
      const response = await api.post(
        `/organizations/${organization.id}/access-groups/${groupId}/members`,
        memberData
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const removeGroupMember = async (groupId, memberId) => {
    try {
      await api.delete(
        `/organizations/${organization.id}/access-groups/${groupId}/members/${memberId}`
      );
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const getGroupRoles = async (groupId) => {
    try {
      const response = await api.get(
        `/organizations/${organization.id}/access-groups/${groupId}/roles`
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const assignGroupRole = async (groupId, roleId) => {
    try {
      const response = await api.post(
        `/organizations/${organization.id}/access-groups/${groupId}/roles`,
        { roleId }
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const removeGroupRole = async (groupId, roleId) => {
    try {
      await api.delete(
        `/organizations/${organization.id}/access-groups/${groupId}/roles/${roleId}`
      );
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  useEffect(() => {
    if (organization?.id) {
      fetchGroups();
    }
  }, [organization?.id]);

  return {
    groups,
    isLoading,
    error,
    createGroup,
    updateGroup,
    deleteGroup,
    getGroupDetails,
    getGroupMembers,
    addGroupMember,
    removeGroupMember,
    getGroupRoles,
    assignGroupRole,
    removeGroupRole,
    refreshGroups: fetchGroups,
  };
}; 