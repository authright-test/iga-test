import { toast } from 'react-toastify';
import jwt_decode from 'jwt-decode';
import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api.js';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken'));
  const [loading, setLoading] = useState(true);

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
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  };

  // Check if user is authenticated
  const isAuthenticated = token && !isTokenExpired(token);

  // Refresh token function
  const refreshAccessToken = async () => {
    try {
      const res = await api.post('/auth/refresh', {
        refreshToken: refreshToken
      });
      const { token: newToken, refreshToken: newRefreshToken } = res.data;
      setToken(newToken);
      setRefreshToken(newRefreshToken);
      setAuthToken(newToken);
      localStorage.setItem('token', newToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      return true;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return false;
    }
  };

  const verifyToken = async (token) => {
    if (!token) {
      return;
    }
    setLoading(true);
    if (!isTokenExpired(token)) {
      setAuthToken(token);
      try {
        const res = await api.get('/auth/verify');
        setUser(res.data.user);
        setOrganization(res.data.organization);
      } catch (error) {
        // If verification fails, try to refresh the token
        const refreshSuccess = await refreshAccessToken();
        if (!refreshSuccess) {
          // Only clear everything if refresh fails
          setToken(null);
          setRefreshToken(null);
          setUser(null);
          setOrganization(null);
          setAuthToken(null);
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');

          toast.error('Session Expired. Please log in again.', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }
      }
    } else {
      // Token expired, try to refresh
      const refreshSuccess = await refreshAccessToken();
      if (!refreshSuccess) {
        // Only clear everything if refresh fails
        setToken(null);
        setRefreshToken(null);
        setUser(null);
        setOrganization(null);
        setAuthToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');

        toast.error('Session Expired. Please log in again.', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    }
    setLoading(false);
  };

  // Login user
  const login = async (code) => {
    try {
      setLoading(true);
      const res = await api.post('/auth/login', { code });
      const { token, refreshToken, user, organization } = res.data;
      setToken(token);
      setRefreshToken(refreshToken);
      setUser(user);
      setOrganization(organization);
      setAuthToken(token);
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);

      // 记录登录审计日志
      if (user && organization) {
        try {
          await api.post(`/api/audit/organization/${organization.id}/logs`, {
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

      toast.success('Successfully logged in!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      return true;
    } catch (error) {
      toast.error('Failed to log in. Please try again.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      // 记录登出审计日志
      if (user && organization) {
        try {
          await api.post(`/api/audit/organization/${organization.id}/logs`, {
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

      // 调用后端logout API
      if (token) {
        try {
          await api.post('/auth/logout');
        } catch (error) {
          console.error('Failed to logout from server:', error);
        }
      }

      // 清除本地状态
      setToken(null);
      setRefreshToken(null);
      setUser(null);
      setOrganization(null);
      setAuthToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    } catch (error) {
      console.error('Logout error:', error);
      // 即使出错也清除本地状态
      setToken(null);
      setRefreshToken(null);
      setUser(null);
      setOrganization(null);
      setAuthToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
  };

  // 记录审计日志
  const logAuditEvent = async (action, resourceType, resourceId, details = {}) => {
    if (!organization) return false;

    try {
      await api.post(`/api/audit/organization/${organization.id}/logs`, {
        action,
        resourceType,
        resourceId,
        details
      });
      return true;
    } catch (error) {
      console.error('Failed to log audit event:', error);
      return false;
    }
  };

  // Verify token on app load
  useEffect(() => {
    verifyToken(token).then(() => {
      setLoading(false);
    });
  }, [token]);

  // Value to provide to consumers
  const value = {
    token,
    user,
    organization,
    loading,
    isAuthenticated,
    verifyToken,
    login,
    logout,
    logAuditEvent
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
