import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import jwt_decode from 'jwt-decode';
import { AuthProvider, useAuth } from '../AuthContext';

// Mock dependencies
jest.mock('axios');
jest.mock('jwt-decode');

// Test component that uses auth context
const TestAuthComponent = () => {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  return (
    <div>
      <div data-testid="auth-status">
        {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
      </div>
      {user && <div data-testid="username">{user.username}</div>}
      <button data-testid="login-btn" onClick={() => login('test-code')}>
        Login
      </button>
      <button data-testid="logout-btn" onClick={logout}>
        Logout
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    // Clear mocks
    jest.clearAllMocks();
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn()
      },
      writable: true
    });
    
    // Mock axios
    axios.defaults = { headers: { common: {} } };
    axios.post.mockResolvedValue({
      data: {
        token: 'test-token',
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com'
        },
        organization: {
          id: 1,
          name: 'Test Org',
          login: 'test-org'
        }
      }
    });
    
    axios.get.mockResolvedValue({
      data: {
        valid: true,
        user: {
          id: 1,
          githubId: '12345',
          username: 'testuser'
        }
      }
    });
    
    // Mock jwt_decode
    jwt_decode.mockImplementation(() => ({
      userId: 1,
      exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
    }));
  });
  
  it('should initialize with unauthenticated state when no token in storage', async () => {
    // Mock no token in localStorage
    window.localStorage.getItem.mockReturnValue(null);
    
    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    );
    
    // Wait for auth check to complete
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
    });
    
    expect(window.localStorage.getItem).toHaveBeenCalledWith('token');
  });
  
  it('should attempt to verify token if found in storage', async () => {
    // Mock token in localStorage
    window.localStorage.getItem.mockReturnValue('test-token');
    
    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/auth/verify');
    });
    
    // After verification
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    expect(screen.getByTestId('username')).toHaveTextContent('testuser');
  });
  
  it('should log user in successfully', async () => {
    // Start with no token
    window.localStorage.getItem.mockReturnValue(null);
    
    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    );
    
    // Check initial state
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
    });
    
    // Click login
    await act(async () => {
      userEvent.click(screen.getByTestId('login-btn'));
    });
    
    // Expect login API call
    expect(axios.post).toHaveBeenCalledWith('/auth/login', { code: 'test-code' });
    
    // Check authenticated state
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('username')).toHaveTextContent('testuser');
    });
    
    // Check token stored
    expect(window.localStorage.setItem).toHaveBeenCalledWith('token', 'test-token');
    
    // Check auth header set
    expect(axios.defaults.headers.common.Authorization).toBe('Bearer test-token');
  });
  
  it('should log user out successfully', async () => {
    // Start with a token
    window.localStorage.getItem.mockReturnValue('test-token');
    
    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    );
    
    // Ensure logged in initially
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    });
    
    // Click logout
    await act(async () => {
      userEvent.click(screen.getByTestId('logout-btn'));
    });
    
    // Check logged out state
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
    
    // Check token removed
    expect(window.localStorage.removeItem).toHaveBeenCalledWith('token');
    
    // Check auth header removed
    expect(axios.defaults.headers.common.Authorization).toBeUndefined();
  });
  
  it('should handle expired token', async () => {
    // Mock expired token
    window.localStorage.getItem.mockReturnValue('expired-token');
    
    // Mock jwt_decode to return expired token
    jwt_decode.mockImplementation(() => ({
      userId: 1,
      exp: Math.floor(Date.now() / 1000) - 3600 // 1 hour in the past
    }));
    
    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    );
    
    // Should detect expired token and remove it
    await waitFor(() => {
      expect(window.localStorage.removeItem).toHaveBeenCalledWith('token');
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
    });
  });
}); 