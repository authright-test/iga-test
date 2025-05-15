import { useToast } from '@chakra-ui/react';
import axios from 'axios';
import jwt_decode from 'jwt-decode';
import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  // Check if token is expired
  const isTokenExpired = (token) => {
    if (!token) return true;
    try {
      const decoded = jwt_decode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch (error) {
      return true;
    }
  };

  // Set auth token in axios headers
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  };

  // Check if user is authenticated
  const isAuthenticated = token && !isTokenExpired(token);

  // Login user
  const login = async (code) => {
    try {
      setIsLoading(true);
      const res = await axios.post('/auth/login', { code });
      const { token, user, organization } = res.data;
      setToken(token);
      setUser(user);
      setOrganization(organization);
      setAuthToken(token);

      // 记录登录审计日志
      if (user && organization) {
        try {
          await axios.post(`/api/audit/organization/${organization.id}/logs`, {
            action: 'user_login',
            resourceType: 'user',
            resourceId: user.id.toString(),
            details: {
              username: user.username,
              email: user.email,
              loginMethod: 'github_oauth'
            }
          });
        } catch (error) {
          console.error('Failed to log audit event:', error);
        }
      }

      return true;
    } catch (error) {
      toast({
        title: 'Authentication Error',
        description: error.response?.data?.error || 'Failed to authenticate with GitHub',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    // 记录登出审计日志
    if (user && organization) {
      try {
        await axios.post(`/api/audit/organization/${organization.id}/logs`, {
          action: 'user_logout',
          resourceType: 'user',
          resourceId: user.id.toString(),
          details: {
            username: user.username,
            email: user.email
          }
        });
      } catch (error) {
        console.error('Failed to log audit event:', error);
      }
    }

    setToken(null);
    setUser(null);
    setOrganization(null);
    setAuthToken(null);
  };

  // 记录审计日志
  const logAuditEvent = async (action, resourceType, resourceId, details = {}) => {
    if (!organization) return false;

    try {
      await axios.post(`/api/audit/organization/${organization.id}/logs`, {
        action,
        resourceType,
        resourceId,
        details
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return true;
    } catch (error) {
      console.error('Failed to log audit event:', error);
      return false;
    }
  };

  // Verify token on app load
  useEffect(() => {
    const verifyToken = async () => {
      setIsLoading(true);
      if (token && !isTokenExpired(token)) {
        setAuthToken(token);
        try {
          const res = await axios.get('/auth/verify');
          setUser(res.data.user);
          setOrganization(res.data.organization);
        } catch (error) {
          setToken(null);
          setUser(null);
          setOrganization(null);
          setAuthToken(null);
        }
      } else if (token) {
        // Token expired
        setToken(null);
        setUser(null);
        setOrganization(null);
        setAuthToken(null);
      }
      setIsLoading(false);
    };

    verifyToken();
  }, [token]);

  // Value to provide to consumers
  const value = {
    token,
    user,
    organization,
    isAuthenticated,
    isLoading,
    login,
    logout,
    logAuditEvent
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
