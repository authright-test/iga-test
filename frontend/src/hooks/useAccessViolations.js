import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import api from '../api/api';

export const useAccessViolations = () => {
  const [violations, setViolations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { organization } = useAuth();

  const fetchViolations = async (filters = {}) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get(
        `/organizations/${organization.id}/access-violations`,
        { params: filters }
      );

      setViolations(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getViolationDetails = async (violationId) => {
    try {
      const response = await api.get(
        `/organizations/${organization.id}/access-violations/${violationId}`
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const resolveViolation = async (violationId, resolutionData) => {
    try {
      const response = await api.post(
        `/organizations/${organization.id}/access-violations/${violationId}/resolve`,
        resolutionData
      );
      setViolations(violations.map(violation =>
        violation.id === violationId ? response.data : violation
      ));
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const getViolationHistory = async (violationId) => {
    try {
      const response = await api.get(
        `/organizations/${organization.id}/access-violations/${violationId}/history`
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const getViolationStats = async () => {
    try {
      const response = await api.get(
        `/organizations/${organization.id}/access-violations/stats`
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const exportViolations = async (filters = {}, format = 'csv') => {
    try {
      const response = await api.get(
        `/organizations/${organization.id}/access-violations/export`,
        {
          params: { ...filters, format },
          responseType: 'blob'
        }
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  useEffect(() => {
    if (organization?.id) {
      fetchViolations();
    }
  }, [organization?.id]);

  return {
    violations,
    isLoading,
    error,
    getViolationDetails,
    resolveViolation,
    getViolationHistory,
    getViolationStats,
    exportViolations,
    refreshViolations: fetchViolations,
  };
};
