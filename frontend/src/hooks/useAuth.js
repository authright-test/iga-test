import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

/**
 * Authentication Hook
 * Manages authentication state and operations
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check authentication status on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      verifyToken();
    } else {
      setLoading(false);
    }
  }, []);

  // Verify token with backend
  const verifyToken = async () => {
    try {
      const response = await api.get('/auth/verify');
      setUser(response.data.user);
      setError(null);
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('token');
      setUser(null);
      setError('Session expired. Please login again.');
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = useCallback(async (token) => {
    try {
      localStorage.setItem('token', token);
      await verifyToken();
    } catch (error) {
      console.error('Login failed:', error);
      setError('Login failed. Please try again.');
      throw error;
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  }, []);

  return {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user
  };
}; 