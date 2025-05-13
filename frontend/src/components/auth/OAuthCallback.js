import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Spinner, Box, Text, Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/react';
import { useAuth } from '../../hooks/useAuth';

/**
 * OAuth Callback Component
 * Handles the OAuth callback from GitHub and processes the authentication token
 */
const OAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const error = params.get('error');
        const errorDescription = params.get('error_description');

        if (error) {
          throw new Error(errorDescription || 'Authentication failed');
        }

        if (!token) {
          throw new Error('No token received');
        }

        // Store token and update auth state
        await login(token);
        
        // Redirect to dashboard or home page
        navigate('/dashboard', { replace: true });
      } catch (error) {
        console.error('OAuth callback error:', error);
        setError(error.message || 'Authentication failed');
        
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          navigate('/login', { 
            replace: true,
            state: { error: error.message || 'Authentication failed' }
          });
        }, 3000);
      }
    };

    handleCallback();
  }, [location, navigate, login]);

  if (error) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        p={4}
      >
        <Alert
          status="error"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          height="200px"
          mb={4}
        >
          <AlertIcon boxSize="40px" mr={0} />
          <AlertTitle mt={4} mb={1} fontSize="lg">
            Authentication Failed
          </AlertTitle>
          <AlertDescription maxWidth="sm">
            {error}
          </AlertDescription>
        </Alert>
        <Text>
          Redirecting to login page...
        </Text>
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
    >
      <Spinner
        thickness="4px"
        speed="0.65s"
        emptyColor="gray.200"
        color="blue.500"
        size="xl"
      />
      <Text mt={4} fontSize="lg">
        Completing authentication...
      </Text>
    </Box>
  );
};

export default OAuthCallback; 