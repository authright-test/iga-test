import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import api from '../services/api';

export const useStats = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { organization } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      if (!organization?.id) return;

      try {
        setIsLoading(true);
        const response = await api.get(`/api/organizations/${organization.id}/stats`);
        setStats(response.data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [organization?.id]);

  return { stats, isLoading, error };
};
