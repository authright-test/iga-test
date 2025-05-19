import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import api from '../api/api';

export const useAccessResources = () => {
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { organization } = useAuth();

  const fetchResources = async (filters = {}) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get(
        `/organizations/${organization.id}/access-resources`,
        { params: filters }
      );

      setResources(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const createResource = async (resourceData) => {
    try {
      const response = await api.post(
        `/organizations/${organization.id}/access-resources`,
        resourceData
      );
      setResources([...resources, response.data]);
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const updateResource = async (resourceId, resourceData) => {
    try {
      const response = await api.put(
        `/organizations/${organization.id}/access-resources/${resourceId}`,
        resourceData
      );
      setResources(resources.map(resource =>
        resource.id === resourceId ? response.data : resource
      ));
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const deleteResource = async (resourceId) => {
    try {
      await api.delete(
        `/organizations/${organization.id}/access-resources/${resourceId}`
      );
      setResources(resources.filter(resource => resource.id !== resourceId));
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const getResourceDetails = async (resourceId) => {
    try {
      const response = await api.get(
        `/organizations/${organization.id}/access-resources/${resourceId}`
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const getResourcePermissions = async (resourceId) => {
    try {
      const response = await api.get(
        `/organizations/${organization.id}/access-resources/${resourceId}/permissions`
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const updateResourcePermissions = async (resourceId, permissions) => {
    try {
      const response = await api.put(
        `/organizations/${organization.id}/access-resources/${resourceId}/permissions`,
        permissions
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const getResourceAccessHistory = async (resourceId) => {
    try {
      const response = await api.get(
        `/organizations/${organization.id}/access-resources/${resourceId}/access-history`
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const getResourceViolations = async (resourceId) => {
    try {
      const response = await api.get(
        `/organizations/${organization.id}/access-resources/${resourceId}/violations`
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const getResourceStats = async (resourceId) => {
    try {
      const response = await api.get(
        `/organizations/${organization.id}/access-resources/${resourceId}/stats`
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  useEffect(() => {
    if (organization?.id) {
      fetchResources();
    }
  }, [organization?.id]);

  return {
    resources,
    isLoading,
    error,
    createResource,
    updateResource,
    deleteResource,
    getResourceDetails,
    getResourcePermissions,
    updateResourcePermissions,
    getResourceAccessHistory,
    getResourceViolations,
    getResourceStats,
    refreshResources: fetchResources,
  };
};
