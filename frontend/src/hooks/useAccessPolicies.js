import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import api from '../api/api';

export const useAccessPolicies = () => {
  const [policies, setPolicies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { organization } = useAuth();

  const fetchPolicies = async (filters = {}) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get(
        `/organizations/${organization.id}/access-policies`,
        { params: filters }
      );

      setPolicies(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const createPolicy = async (policyData) => {
    try {
      const response = await api.post(
        `/organizations/${organization.id}/access-policies`,
        policyData
      );
      setPolicies([...policies, response.data]);
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const updatePolicy = async (policyId, policyData) => {
    try {
      const response = await api.put(
        `/organizations/${organization.id}/access-policies/${policyId}`,
        policyData
      );
      setPolicies(policies.map(policy =>
        policy.id === policyId ? response.data : policy
      ));
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const deletePolicy = async (policyId) => {
    try {
      await api.delete(
        `/organizations/${organization.id}/access-policies/${policyId}`
      );
      setPolicies(policies.filter(policy => policy.id !== policyId));
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const enablePolicy = async (policyId) => {
    try {
      const response = await api.post(
        `/organizations/${organization.id}/access-policies/${policyId}/enable`
      );
      setPolicies(policies.map(policy =>
        policy.id === policyId ? response.data : policy
      ));
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const disablePolicy = async (policyId) => {
    try {
      const response = await api.post(
        `/organizations/${organization.id}/access-policies/${policyId}/disable`
      );
      setPolicies(policies.map(policy =>
        policy.id === policyId ? response.data : policy
      ));
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const getPolicyDetails = async (policyId) => {
    try {
      const response = await api.get(
        `/organizations/${organization.id}/access-policies/${policyId}`
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const getPolicyViolations = async (policyId) => {
    try {
      const response = await api.get(
        `/organizations/${organization.id}/access-policies/${policyId}/violations`
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const getPolicyHistory = async (policyId) => {
    try {
      const response = await api.get(
        `/organizations/${organization.id}/access-policies/${policyId}/history`
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  useEffect(() => {
    if (organization?.id) {
      fetchPolicies();
    }
  }, [organization?.id]);

  return {
    policies,
    isLoading,
    error,
    createPolicy,
    updatePolicy,
    deletePolicy,
    enablePolicy,
    disablePolicy,
    getPolicyDetails,
    getPolicyViolations,
    getPolicyHistory,
    refreshPolicies: fetchPolicies,
  };
};
