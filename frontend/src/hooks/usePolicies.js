import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import api from '../services/api';

export const usePolicies = () => {
  const [policies, setPolicies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { organization } = useAuth();

  useEffect(() => {
    const fetchPolicies = async () => {
      if (!organization?.id) return;

      try {
        setIsLoading(true);
        const response = await api.get(`/api/policies/organization/${organization.id}`);
        setPolicies(response.data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPolicies();
  }, [organization?.id]);

  const createPolicy = async (policyData) => {
    try {
      const response = await api.post(`/api/policies/organization/${organization.id}`, policyData);
      setPolicies(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updatePolicy = async (policyId, policyData) => {
    try {
      const response = await api.put(`/api/policies/${policyId}`, policyData);
      setPolicies(prev => prev.map(p => p.id === policyId ? response.data : p));
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deletePolicy = async (policyId) => {
    try {
      await api.delete(`/api/policies/${policyId}`);
      setPolicies(prev => prev.filter(p => p.id !== policyId));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    policies,
    isLoading,
    error,
    createPolicy,
    updatePolicy,
    deletePolicy
  };
};
