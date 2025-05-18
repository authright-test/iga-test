import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext.jsx';

/**
 * Custom hook for managing dashboard data and state
 * @returns {Object} Dashboard data and control functions
 */
export const useDashboard = () => {
  const { organization } = useAuth();
  const queryClient = useQueryClient();
  const [error, setError] = useState(null);

  // Fetch dashboard statistics
  const fetchStats = async () => {
    const response = await api.get(`/dashboard/stats/${organization.id}`);
    return response.data;
  };

  // Fetch recent activities
  const fetchRecentActivities = async () => {
    const response = await api.get(`/dashboard/activities/${organization.id}`);
    return response.data;
  };

  // Use React Query for data fetching and caching
  const {
    data: stats,
    isLoading: isStatsLoading,
    error: statsError,
  } = useQuery(
    ['dashboardStats', organization?.id],
    fetchStats,
    {
      enabled: !!organization?.id,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
    }
  );

  const {
    data: recentActivities,
    isLoading: isActivitiesLoading,
    error: activitiesError,
  } = useQuery(
    ['dashboardActivities', organization?.id],
    fetchRecentActivities,
    {
      enabled: !!organization?.id,
      staleTime: 1 * 60 * 1000, // 1 minute
      cacheTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Combine loading states
  const isLoading = isStatsLoading || isActivitiesLoading;

  // Combine errors
  const combinedError = statsError || activitiesError;
  if (combinedError) {
    setError(combinedError.message);
  }

  // Function to manually refresh dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setError(null);
      await Promise.all([
        queryClient.invalidateQueries(['dashboardStats', organization?.id]),
        queryClient.invalidateQueries(['dashboardActivities', organization?.id]),
      ]);
    } catch (err) {
      setError(err.message);
    }
  }, [queryClient, organization?.id]);

  return {
    stats,
    recentActivities,
    isLoading,
    error,
    fetchDashboardData,
  };
};

export default useDashboard;
