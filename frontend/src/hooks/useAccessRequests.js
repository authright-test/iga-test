import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import api from '../services/api';

export const useAccessRequests = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { organization } = useAuth();

  const fetchRequests = async (filters = {}) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get(
        `/organizations/${organization.id}/access-requests`,
        { params: filters }
      );

      setRequests(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const createRequest = async (requestData) => {
    try {
      const response = await api.post(
        `/organizations/${organization.id}/access-requests`,
        requestData
      );
      setRequests([...requests, response.data]);
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const approveRequest = async (requestId, approvalData) => {
    try {
      const response = await api.post(
        `/organizations/${organization.id}/access-requests/${requestId}/approve`,
        approvalData
      );
      setRequests(requests.map(request =>
        request.id === requestId ? response.data : request
      ));
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const rejectRequest = async (requestId, rejectionData) => {
    try {
      const response = await api.post(
        `/organizations/${organization.id}/access-requests/${requestId}/reject`,
        rejectionData
      );
      setRequests(requests.map(request =>
        request.id === requestId ? response.data : request
      ));
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const cancelRequest = async (requestId) => {
    try {
      const response = await api.post(
        `/organizations/${organization.id}/access-requests/${requestId}/cancel`
      );
      setRequests(requests.map(request =>
        request.id === requestId ? response.data : request
      ));
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const getRequestDetails = async (requestId) => {
    try {
      const response = await api.get(
        `/organizations/${organization.id}/access-requests/${requestId}`
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const getRequestHistory = async (requestId) => {
    try {
      const response = await api.get(
        `/organizations/${organization.id}/access-requests/${requestId}/history`
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  useEffect(() => {
    if (organization?.id) {
      fetchRequests();
    }
  }, [organization?.id]);

  return {
    requests,
    isLoading,
    error,
    createRequest,
    approveRequest,
    rejectRequest,
    cancelRequest,
    getRequestDetails,
    getRequestHistory,
    refreshRequests: fetchRequests,
  };
};
