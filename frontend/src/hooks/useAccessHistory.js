import axios from 'axios';
import { useCallback, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useAccessHistory = () => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { organization } = useAuth();

  const fetchHistory = useCallback(async (params = {}) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.get(`/api/organizations/${organization.id}/access-history`, {
        params: {
          page: params.page || 1,
          limit: params.limit || 50,
          startDate: params.startDate,
          endDate: params.endDate,
          type: params.type,
          userId: params.userId,
          repositoryId: params.repositoryId,
          teamId: params.teamId,
        },
      });

      setHistory(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [organization?.id]);

  const getHistoryByUser = useCallback(async (userId, params = {}) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.get(`/api/organizations/${organization.id}/access-history/users/${userId}`, {
        params: {
          page: params.page || 1,
          limit: params.limit || 50,
          startDate: params.startDate,
          endDate: params.endDate,
          type: params.type,
        },
      });

      setHistory(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [organization?.id]);

  const getHistoryByRepository = useCallback(async (repositoryId, params = {}) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.get(`/api/organizations/${organization.id}/access-history/repositories/${repositoryId}`, {
        params: {
          page: params.page || 1,
          limit: params.limit || 50,
          startDate: params.startDate,
          endDate: params.endDate,
          type: params.type,
        },
      });

      setHistory(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [organization?.id]);

  const getHistoryByTeam = useCallback(async (teamId, params = {}) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.get(`/api/organizations/${organization.id}/access-history/teams/${teamId}`, {
        params: {
          page: params.page || 1,
          limit: params.limit || 50,
          startDate: params.startDate,
          endDate: params.endDate,
          type: params.type,
        },
      });

      setHistory(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [organization?.id]);

  const exportHistory = useCallback(async (params = {}) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.get(`/api/organizations/${organization.id}/access-history/export`, {
        params: {
          startDate: params.startDate,
          endDate: params.endDate,
          type: params.type,
          userId: params.userId,
          repositoryId: params.repositoryId,
          teamId: params.teamId,
          format: params.format || 'csv',
        },
        responseType: 'blob',
      });

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `access-history-${new Date().toISOString()}.${params.format || 'csv'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      return true;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [organization?.id]);

  return {
    history,
    isLoading,
    error,
    fetchHistory,
    getHistoryByUser,
    getHistoryByRepository,
    getHistoryByTeam,
    exportHistory,
  };
};
