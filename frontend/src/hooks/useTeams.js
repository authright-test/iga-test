import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import api from '../api/api';

export const useTeams = () => {
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { organization } = useAuth();

  const getTeams = async (filters = {}) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get(
        `/organizations/${organization.id}/teams`,
        { params: filters }
      );

      setTeams(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const createTeam = async (teamData) => {
    try {
      const response = await api.post(
        `/organizations/${organization.id}/teams`,
        teamData
      );
      setTeams([...teams, response.data]);
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const updateTeam = async (teamId, teamData) => {
    try {
      const response = await api.put(
        `/organizations/${organization.id}/teams/${teamId}`,
        teamData
      );
      setTeams(teams.map(team =>
        team.id === teamId ? response.data : team
      ));
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const deleteTeam = async (teamId) => {
    try {
      await api.delete(
        `/organizations/${organization.id}/teams/${teamId}`
      );
      setTeams(teams.filter(team => team.id !== teamId));
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const getTeamMembers = async (teamId) => {
    try {
      const response = await api.get(
        `/organizations/${organization.id}/teams/${teamId}/members`
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const addMember = async (teamId, userId) => {
    try {
      const response = await api.post(
        `/organizations/${organization.id}/teams/${teamId}/members`,
        { userId }
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const removeMember = async (teamId, userId) => {
    try {
      const response = await api.delete(
        `/organizations/${organization.id}/teams/${teamId}/members/${userId}`
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const getTeamRepositories = async (teamId) => {
    try {
      const response = await api.get(
        `/organizations/${organization.id}/teams/${teamId}/repositories`
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const addRepository = async (teamId, repoId) => {
    try {
      const response = await api.post(
        `/organizations/${organization.id}/teams/${teamId}/repositories`,
        { repoId }
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const removeRepository = async (teamId, repoId) => {
    try {
      const response = await api.delete(
        `/organizations/${organization.id}/teams/${teamId}/repositories/${repoId}`
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const getTeamPermissions = async (teamId) => {
    try {
      const response = await api.get(
        `/organizations/${organization.id}/teams/${teamId}/permissions`
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const updateTeamPermissions = async (teamId, permissions) => {
    try {
      const response = await api.put(
        `/organizations/${organization.id}/teams/${teamId}/permissions`,
        permissions
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  useEffect(() => {
    if (organization?.id) {
      getTeams();
    }
  }, [organization?.id]);

  return {
    teams,
    isLoading,
    error,
    getTeams,
    createTeam,
    updateTeam,
    deleteTeam,
    getTeamMembers,
    addMember,
    removeMember,
    getTeamRepositories,
    addRepository,
    removeRepository,
    getTeamPermissions,
    updateTeamPermissions,
  };
};
