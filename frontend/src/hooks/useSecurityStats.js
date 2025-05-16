import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export const useSecurityStats = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { organization } = useAuth();

  const fetchStats = async () => {
    if (!organization?.id) return;

    try {
      setIsLoading(true);
      const response = await api.get(`/api/security/organization/${organization.id}/stats`);
      setStats(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Set up polling for real-time updates
    const interval = setInterval(fetchStats, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [organization?.id]);

  const getThreatDetails = async (threatId) => {
    try {
      const response = await api.get(`/api/security/threats/${threatId}`);
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const getVulnerabilityReport = async () => {
    try {
      const response = await api.get(`/api/security/organization/${organization.id}/vulnerabilities`);
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const getAccessViolations = async (filters = {}) => {
    try {
      const response = await api.get(`/api/security/organization/${organization.id}/violations`, {
        params: filters
      });
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const getSecurityIncidents = async (timeRange) => {
    try {
      const response = await api.get(`/api/security/organization/${organization.id}/incidents`, {
        params: { timeRange }
      });
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const applySecurityRecommendation = async (recommendationId) => {
    try {
      const response = await api.post(`/api/security/recommendations/${recommendationId}/apply`);
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const exportSecurityReport = async (reportType, filters = {}) => {
    try {
      const response = await api.get(`/api/security/organization/${organization.id}/export/${reportType}`, {
        params: filters,
        responseType: 'blob'
      });
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  return {
    stats,
    isLoading,
    error,
    refreshStats: fetchStats,
    getThreatDetails,
    getVulnerabilityReport,
    getAccessViolations,
    getSecurityIncidents,
    applySecurityRecommendation,
    exportSecurityReport
  };
};
