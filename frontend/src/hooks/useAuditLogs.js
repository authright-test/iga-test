import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export const useAuditLogs = (options = {}) => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { organization } = useAuth();
  const { limit = 10, page = 1 } = options;

  useEffect(() => {
    const fetchLogs = async () => {
      if (!organization?.id) return;

      try {
        setIsLoading(true);
        const response = await api.get(`/api/audit/organization/${organization.id}/logs`, {
          params: {
            limit,
            page,
            ...options
          }
        });
        setLogs(response.data.logs);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [organization?.id, limit, page, options]);

  const getLogDetails = async (logId) => {
    try {
      const response = await api.get(
        `/organizations/${organization.id}/audit-logs/${logId}`
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const exportLogs = async (filters = {}) => {
    try {
      const response = await api.get(
        `/organizations/${organization.id}/audit-logs/export`,
        {
          params: filters,
          responseType: 'blob'
        }
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const getLogStats = async () => {
    try {
      const response = await api.get(
        `/organizations/${organization.id}/audit-logs/stats`
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const getLogTrends = async (timeRange) => {
    try {
      const response = await api.get(
        `/organizations/${organization.id}/audit-logs/trends`,
        { params: { timeRange } }
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  return {
    logs,
    isLoading,
    error,
    getLogDetails,
    exportLogs,
    getLogStats,
    getLogTrends,
  };
};
