import axios from 'axios';
import { toast } from 'react-toastify';

/**
 * API service configuration and error handling
 * Provides centralized API request handling with comprehensive error management
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_API_URL || '/api',
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor for adding auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Error message mapping for different error types
 * Provides user-friendly messages for various error scenarios
 */
const errorMessages = {
  // Network errors
  NETWORK_ERROR: 'Network connection error. Please check your internet connection.',
  TIMEOUT_ERROR: 'Request timeout. Please try again.',
  SERVER_ERROR: 'Server error. Please try again later.',

  // Authentication errors
  UNAUTHORIZED: 'Your session has expired. Please log in again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  INVALID_TOKEN: 'Invalid authentication token. Please log in again.',

  // Validation errors
  VALIDATION_ERROR: 'Please check your input and try again.',
  INVALID_INPUT: 'Invalid input provided.',

  // Resource errors
  NOT_FOUND: 'The requested resource was not found.',
  CONFLICT: 'This action conflicts with the current state.',

  // Rate limiting
  RATE_LIMIT: 'Too many requests. Please try again later.',

  // GitHub API specific errors
  GITHUB_API_ERROR: 'Error communicating with GitHub. Please try again.',
  GITHUB_RATE_LIMIT: 'GitHub API rate limit exceeded. Please try again later.',

  // Default error
  DEFAULT_ERROR: 'An unexpected error occurred. Please try again.'
};

/**
 * Parse error response and return appropriate error message
 * @param {Error} error - The error object
 * @returns {string} User-friendly error message
 */
const parseErrorMessage = (error) => {
  if (!error.response) {
    if (error.code === 'ECONNABORTED') {
      return errorMessages.TIMEOUT_ERROR;
    }
    if (error.message === 'Network Error') {
      return errorMessages.NETWORK_ERROR;
    }
    return errorMessages.DEFAULT_ERROR;
  }

  const { status, data } = error.response;

  // Handle specific error cases
  switch (status) {
    case 400:
      if (data.error === 'VALIDATION_ERROR') {
        return data.details || errorMessages.VALIDATION_ERROR;
      }
      return data.error || errorMessages.INVALID_INPUT;

    case 401:
      if (data.error === 'INVALID_TOKEN') {
        return errorMessages.INVALID_TOKEN;
      }
      return errorMessages.UNAUTHORIZED;

    case 403:
      return data.error || errorMessages.FORBIDDEN;

    case 404:
      return errorMessages.NOT_FOUND;

    case 409:
      return errorMessages.CONFLICT;

    case 429:
      return errorMessages.RATE_LIMIT;

    case 500:
    case 502:
    case 503:
    case 504:
      if (data.error?.includes('GitHub')) {
        return errorMessages.GITHUB_API_ERROR;
      }
      return errorMessages.SERVER_ERROR;

    default:
      return data.error || errorMessages.DEFAULT_ERROR;
  }
};

/**
 * Handle error response and show appropriate toast message
 * @param {Error} error - The error object
 * @param {Object} options - Additional options for error handling
 * @returns {Promise} Rejected promise with error
 */
const handleError = (error, options = {}) => {
  const errorMessage = parseErrorMessage(error);

  // Show error toast
  toast.error(errorMessage, {
    position: 'top-right',
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });

  // Log error for debugging
  console.error('API Error:', {
    message: errorMessage,
    originalError: error,
    options
  });

  return Promise.reject(error);
};

// Response interceptor for handling errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post('/auth/refresh', { refreshToken });
        const { token, refreshToken: newRefreshToken } = response.data;

        // Update tokens in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', newRefreshToken);

        // Update request header
        originalRequest.headers.Authorization = `Bearer ${token}`;

        // Retry original request
        return api(originalRequest);
      } catch (refreshError) {
        // Clear auth state and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return handleError(refreshError);
      }
    }

    // Handle other errors
    return handleError(error);
  }
);

/**
 * Custom error class for API errors
 * Provides additional context for error handling
 */
export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Wrapper function for API requests with enhanced error handling
 * @param {Function} requestFn - The API request function
 * @param {Object} options - Additional options for the request
 * @returns {Promise} Promise with the API response
 */
export const apiRequest = async (requestFn, options = {}) => {
  try {
    const response = await requestFn();
    return response.data;
  } catch (error) {
    throw new ApiError(
      parseErrorMessage(error),
      error.response?.status,
      error.response?.data
    );
  }
};

export default api;
