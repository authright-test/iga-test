import { Alert, Box, Spinner, Text } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * OAuth Callback Component
 * Handles the OAuth callback from GitHub and processes the authentication token
 */
const OAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyToken } = useAuth();
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
        await verifyToken(token);

        // Redirect to dashboard or home page
        navigate('/dashboard', { replace: true });
      } catch (error) {
        console.error('OAuth callback error:', error);
        setError(error.message || 'Authentication failed');

        // Redirect to login page after 10 seconds
        setTimeout(() => {
          navigate('/login', {
            replace: true,
            state: { error: error.message || 'Authentication failed' }
          });
        }, 10000);
      }
    };

    handleCallback();
  }, [location, navigate, verifyToken]);

  if (error) {
    return (
      <Box
        display='flex'
        flexDirection='column'
        alignItems='center'
        justifyContent='center'
        minHeight='100vh'
        p={4}
      >
        <Alert.Root
          status='error'
          variant='subtle'
          flexDirection='column'
          alignItems='center'
          justifyContent='center'
          textAlign='center'
          height='200px'
          width='300px'
          margin='auto'
          mb={4}
        >
          <Alert.Indicator />
          <Alert.Title mt={4} mb={1} fontSize='lg'>
            Authentication Failed
          </Alert.Title>
          <Alert.Description maxWidth='sm'>
            {error}
          </Alert.Description>
        </Alert.Root>
        <Text>
          Redirecting to login page...
        </Text>
      </Box>
    );
  }

  return (
    <Box
      display='flex'
      flexDirection='column'
      alignItems='center'
      justifyContent='center'
      minHeight='100vh'
    >
      <Spinner
        borderWidth='4px'
        animationDuration='0.65s'
        emptyColor='gray.200'
        color='blue.500'
        size='xl'
      />
      <Text mt={4} fontSize='lg'>
        Completing authentication...
      </Text>
    </Box>
  );
};

export default OAuthCallback;
