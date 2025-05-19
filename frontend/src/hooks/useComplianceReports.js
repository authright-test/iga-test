import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import api from '../api/api';

export const useComplianceReports = () => {
  const [reports, setReports] = useState([]);
  const [violations, setViolations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { organization } = useAuth();

  const fetchReports = async (filters = {}) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get(
        `/organizations/${organization.id}/compliance/reports`,
        { params: filters }
      );

      setReports(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchViolations = async (filters = {}) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get(
        `/organizations/${organization.id}/compliance/violations`,
        { params: filters }
      );

      setViolations(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = async (reportData) => {
    try {
      const response = await api.post(
        `/organizations/${organization.id}/compliance/reports/generate`,
        reportData
      );
      setReports([...reports, response.data]);
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const getReportDetails = async (reportId) => {
    try {
      const response = await api.get(
        `/organizations/${organization.id}/compliance/reports/${reportId}`
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const getViolationDetails = async (violationId) => {
    try {
      const response = await api.get(
        `/organizations/${organization.id}/compliance/violations/${violationId}`
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const resolveViolation = async (violationId, resolutionData) => {
    try {
      const response = await api.post(
        `/organizations/${organization.id}/compliance/violations/${violationId}/resolve`,
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

  const exportReport = async (reportId, format = 'pdf') => {
    try {
      const response = await api.get(
        `/organizations/${organization.id}/compliance/reports/${reportId}/export`,
        {
          params: { format },
          responseType: 'blob'
        }
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const getComplianceStats = async () => {
    try {
      const response = await api.get(
        `/organizations/${organization.id}/compliance/stats`
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  useEffect(() => {
    if (organization?.id) {
      fetchReports();
      fetchViolations();
    }
  }, [organization?.id]);

  return {
    reports,
    violations,
    isLoading,
    error,
    generateReport,
    getReportDetails,
    getViolationDetails,
    resolveViolation,
    exportReport,
    getComplianceStats,
    refreshReports: fetchReports,
    refreshViolations: fetchViolations,
  };
};
