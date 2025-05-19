import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import api from '../api/api';

export const useOrganization = () => {
  const [organization, setOrganization] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { organization: authOrg } = useAuth();

  const fetchOrganization = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get(
        `/organizations/${authOrg.id}`
      );

      setOrganization(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrganization = async (orgData) => {
    try {
      const response = await api.put(
        `/organizations/${authOrg.id}`,
        orgData
      );
      setOrganization(response.data);
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const getOrganizationStats = async () => {
    try {
      const response = await api.get(
        `/organizations/${authOrg.id}/stats`
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const getOrganizationSettings = async () => {
    try {
      const response = await api.get(
        `/organizations/${authOrg.id}/settings`
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const updateOrganizationSettings = async (settings) => {
    try {
      const response = await api.put(
        `/organizations/${authOrg.id}/settings`,
        settings
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const getOrganizationMembers = async () => {
    try {
      const response = await api.get(
        `/organizations/${authOrg.id}/members`
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const getOrganizationRepositories = async () => {
    try {
      const response = await api.get(
        `/organizations/${authOrg.id}/repositories`
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const getOrganizationTeams = async () => {
    try {
      const response = await api.get(
        `/organizations/${authOrg.id}/teams`
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  useEffect(() => {
    if (authOrg?.id) {
      fetchOrganization();
    }
  }, [authOrg?.id]);

  return {
    organization,
    isLoading,
    error,
    updateOrganization,
    getOrganizationStats,
    getOrganizationSettings,
    updateOrganizationSettings,
    getOrganizationMembers,
    getOrganizationRepositories,
    getOrganizationTeams,
    refreshOrganization: fetchOrganization,
  };
};
