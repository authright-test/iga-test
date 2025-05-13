import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const useAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { organization } = useAuth();

  const fetchLogs = async (filters = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.get(
        `/organizations/${organization.id}/audit-logs`,
        { params: filters }
      );
      
      setLogs(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setIsLoading(false);
    }
  };

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

  useEffect(() => {
    if (organization?.id) {
      fetchLogs();
    }
  }, [organization?.id]);

  return {
    logs,
    isLoading,
    error,
    fetchLogs,
    getLogDetails,
    exportLogs,
    getLogStats,
    getLogTrends,
  };
}; 